// background.js - Service worker handling core extension logic: message passing,
// content script injection, and API calls.

// Imports base resume data (text and structured JSON).
import {
  BASE_RESUME_BASICS,
  BASE_RESUME_SUMMARY,
  BASE_RESUME_WORK,
  BASE_RESUME_EDUCATION,
  BASE_RESUME_SKILLS,
  BASE_RESUME_PROJECTS,
} from "./baseResumeData.js";

import { generatePrompt } from "./promptTemplate.js";

const GEMINI_MODEL = "gemini-2.5-pro-exp-03-25";

const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// --- Message Listener ---
// Handles messages from other parts of the extension (e.g., popup).
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerGeneration") {
    console.log("Background: Received triggerGeneration");
    sendMessageToPopup({
      action: "statusUpdate",
      message: "Getting selected text...",
    });

    // Get the active tab and execute the content script.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const activeTabId = tabs[0].id;

        chrome.scripting
          .executeScript({
            target: { tabId: activeTabId },
            // Inject the content script into the active tab.
            // Note: Ensure content.js path is correct relative to manifest.
            files: ["content.js"],
          })
          .then(() => {
            console.log(
              "Background: Injected/confirmed content script. Sending message to get selection."
            );
            chrome.tabs.sendMessage(
              activeTabId,
              { action: "getSelection" },
              (response) => {
                handleContentScriptResponse(response, sendResponse); // Handle async response.
              }
            );
          })
          .catch((err) => {
            handleScriptInjectionError(err, sendResponse);
          });
      } else {
        handleNoActiveTabError(sendResponse);
      }
    });

    // Indicate that the response will be sent asynchronously.
    return true;
  }
});

// --- Content Script Interaction ---

/**
 * Handles the response received from the content script.
 * Processes the selected text, updates the popup status,
 * and triggers the Gemini API call.
 * @param {object} response - The response object from the content script.
 * @param {function} sendResponse - Callback function to send a response.
 */
function handleContentScriptResponse(response, sendResponse) {
  if (chrome.runtime.lastError) {
    console.error(
      "Background: Error sending/receiving message to content script:",
      chrome.runtime.lastError.message
    );
    sendMessageToPopup({
      action: "error",
      message: "Could not communicate with the page. Try reloading.",
    });
    sendResponse({
      status: "error",
      message: chrome.runtime.lastError.message,
    });
    return;
  }

  if (response && response.status === "success" && response.text) {
    console.log("Background: Received selected text.");

    // Update popup with text preview.
    const textPreview =
      response.textPreview ||
      response.text.substring(0, 100) +
        (response.text.length > 100 ? "..." : "");
    sendMessageToPopup({
      action: "statusUpdate",
      message: "Text detected! Preview:",
      textPreview: textPreview,
    });

    setTimeout(() => {
      sendMessageToPopup({
        action: "statusUpdate",
        message: "Generating tailored JSON resume with Gemini...",
      });
      // Initiate Gemini API call with the selected text.
      callGeminiApi(response.text)
        .then((generatedJsonString) => {
          // Gemini API call succeeded.
          console.log(
            "Background: Gemini API call successful, returning JSON string."
          );
          sendMessageToPopup({
            action: "generationComplete",
            // Send the raw JSON string to the popup for parsing.
            text: generatedJsonString,
          });
          sendResponse({ status: "success", text: generatedJsonString });
        })
        .catch((error) => {
          console.error("Background: Gemini API call failed:", error);
          // Create a user-friendly error message based on the error type.
          let userFriendlyError = "Generation Error."; // Default message.
          if (error.message.includes("API key not valid")) {
            userFriendlyError = "Invalid or missing API Key.";
          } else if (error.message.includes("API request failed")) {
            userFriendlyError = "API Request Failed.";
          } else if (error.message.includes("valid JSON")) {
            userFriendlyError = "Failed to generate valid JSON.";
          } else if (error.message.includes("safety")) {
            userFriendlyError = "Content blocked (safety).";
          } else if (error.message.includes("quota")) {
            userFriendlyError = "API Quota Exceeded.";
          } else if (error.message.includes("empty response")) {
            userFriendlyError = "API returned empty response.";
          }

          sendMessageToPopup({
            action: "error",
            message: `Gemini Error: ${userFriendlyError} Details: ${error.message}`,
          });
          sendResponse({ status: "error", message: error.message });
        });
    }, 1000); // Delay for UI feedback consistency.
  } else {
    // Handle cases where getting the selection failed.
    const errorMessage =
      response?.message ||
      (!response?.text
        ? "No text selected on the page."
        : "Failed to get selection from page.");
    console.log("Background: Failed to get selection -", errorMessage);
    sendMessageToPopup({ action: "error", message: errorMessage });
    sendResponse({ status: "error", message: errorMessage });
  }
}

/**
 * Handles errors that occur during content script injection.
 * @param {Error} err - The error object.
 * @param {function} sendResponse - Callback function to send an error response.
 */
function handleScriptInjectionError(err, sendResponse) {
  console.error("Background: Failed to inject content script:", err);
  sendMessageToPopup({
    action: "error",
    message: "Failed to inject script. Reload page/browser.",
  });
  sendResponse({ status: "error", message: err.message });
}

/**
 * Handles errors when the active tab cannot be found.
 * @param {function} sendResponse - Callback function to send an error response.
 */
function handleNoActiveTabError(sendResponse) {
  console.error("Background: Could not get active tab.");
  sendMessageToPopup({
    action: "error",
    message: "Could not identify active tab.",
  });
  sendResponse({ status: "error", message: "No active tab found" });
}

// --- Popup Communication ---

/**
 * Sends messages (status updates, errors, results) to the popup UI.
 * @param {object} message - The message object to send.
 */
function sendMessageToPopup(message) {
  console.log("Background: Sending message to popup:", message.action);
  chrome.runtime.sendMessage(message).catch((error) => {
    // Ignore specific errors if the popup isn't open, log others.
    if (
      error.message !==
        "Could not establish connection. Receiving end does not exist." &&
      error.message !==
        "The message port closed before a response was received."
    ) {
      console.warn(
        "Background: Could not send message to popup:",
        error.message
      );
    }
  });
}

// --- Gemini API Interaction ---

/**
 * Calls the Gemini API to generate a tailored resume JSON based on the job description.
 * Retrieves the API key, constructs the prompt, makes the API call,
 * handles the response (including cleaning and merging), and returns the final JSON string.
 * @param {string} jobDescription - The job description text from the content script.
 * @returns {Promise<string>} A promise that resolves with the generated JSON string.
 */
async function callGeminiApi(jobDescription) {
  // Retrieve API Key from local storage.
  let apiKey;
  try {
    const data = await chrome.storage.local.get(["geminiApiKey"]);
    if (!data.geminiApiKey) {
      throw new Error(
        "Gemini API Key not found. Please set it via the extension's console."
      );
    }
    apiKey = data.geminiApiKey;
  } catch (error) {
    console.error("Background: Error retrieving API key:", error);
    throw new Error(error.message || "Could not retrieve API key.");
  }

  // Construct the API URL.
  const apiUrl = `${GEMINI_API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // Construct the prompt using base resume data and the job description.
  const prompt = generatePrompt(
    BASE_RESUME_WORK,
    BASE_RESUME_SKILLS,
    BASE_RESUME_PROJECTS,
    BASE_RESUME_SUMMARY,
    jobDescription
  );

  // Construct the request body for the Gemini API.
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      // Configuration for the generation process.
      // responseMimeType: "application/json", // Optional: Request JSON directly if supported.
      // temperature: 0.7,
      // topP: 1.0,
      // topK: 40,
      // maxOutputTokens: 8192,
    },
    // safetySettings: [...], // Optional: Configure safety settings.
  };

  console.log("Background: Calling Gemini API for tailored sections.");
  // console.log("Background: Prompt Start:", prompt.substring(0, 300)); // Debugging log.

  // Make the API request using fetch.
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Handle non-successful HTTP responses.
    if (!response.ok) {
      let errorBodyText = await response.text();
      let errorDetails = `HTTP status ${response.status}`;
      try {
        const errorData = JSON.parse(errorBodyText);
        errorDetails += `: ${errorData.error?.message || "Unknown API error"}`;
        if (
          errorData.error?.message?.toLowerCase().includes("api key not valid")
        ) {
          throw new Error(
            "API request failed: API Key not valid. Please check."
          );
        }
        // Add checks for other specific errors (e.g., billing) if needed.
      } catch (e) {
        errorDetails += ` - Body: ${errorBodyText}`;
      }
      console.error(`Background: API request failed: ${errorDetails}`);
      throw new Error(`API request failed: ${errorDetails}`);
    }

    // Parse the successful JSON response.
    const data = await response.json();

    // Validate the response structure and check for candidates.
    const candidate = data?.candidates?.[0];
    if (!candidate) {
      console.error(
        "Background: No candidates in response:",
        JSON.stringify(data, null, 2)
      );
      if (data?.promptFeedback?.blockReason) {
        throw new Error(
          `API prompt blocked: ${data.promptFeedback.blockReason}`
        );
      }
      throw new Error("API returned no candidates. Check Gemini console.");
    }

    const finishReason = candidate.finishReason;
    if (
      finishReason &&
      finishReason !== "STOP" &&
      finishReason !== "MAX_TOKENS"
    ) {
      const safetyRatings = JSON.stringify(candidate.safetyRatings);
      console.warn(
        `Background: Generation stopped: ${finishReason}. Ratings: ${safetyRatings}`
      );
      let reasonMsg = `Generation stopped: ${finishReason}.`;
      if (finishReason === "SAFETY")
        reasonMsg = "Content blocked (safety). Check safety settings.";
      else if (finishReason === "RECITATION")
        reasonMsg = "Content blocked (recitation).";
      throw new Error(reasonMsg);
    }

    // Validate the content structure within the candidate.
    if (
      !candidate.content?.parts?.[0]?.text ||
      typeof candidate.content.parts[0].text !== "string"
    ) {
      console.error(
        "Background: Unexpected API response structure:",
        JSON.stringify(data, null, 2)
      );
      throw new Error("Could not parse text from API response structure.");
    }

    // Extract the generated text (expected to be a JSON string).
    let generatedText = candidate.content.parts[0].text.trim();

    // Clean potential markdown code fences (```json ... ```) from the response.
    const markdownJsonPrefix = "```json";
    const markdownEndFence = "```";
    let cleanedJsonString = generatedText; // Start with the original.

    if (cleanedJsonString.startsWith(markdownJsonPrefix)) {
      cleanedJsonString = cleanedJsonString
        .substring(markdownJsonPrefix.length)
        .trimStart(); // Remove prefix and leading whitespace.
    } else if (cleanedJsonString.startsWith(markdownEndFence)) {
      // Handle case where only ``` is used at the start.
      cleanedJsonString = cleanedJsonString
        .substring(markdownEndFence.length)
        .trimStart();
    }

    if (cleanedJsonString.endsWith(markdownEndFence)) {
      cleanedJsonString = cleanedJsonString
        .substring(0, cleanedJsonString.length - markdownEndFence.length)
        .trimEnd(); // Remove suffix and trailing whitespace.
    }
    // --- End cleaning ---

    // Parse the cleaned JSON string.
    let generatedData;
    try {
      if (!cleanedJsonString) {
        throw new Error(
          "API returned an empty or markdown-only response string after cleaning."
        );
      }
      generatedData = JSON.parse(cleanedJsonString);
      console.log(
        "Background: Successfully parsed generated JSON sections from Gemini."
      );

      // Merge the generated sections with the base resume data.
      const finalResumeJson = {
        basics: BASE_RESUME_BASICS.basics, // Use original basics.
        ...generatedData, // Include generated summary, work, skills, projects.
        education: BASE_RESUME_EDUCATION.education, // Use original education.
        // Add other base sections if needed: ...BASE_RESUME_OTHER
      };
      // --- END MERGING ---

      // Convert the final merged resume object back to a JSON string.
      const finalJsonString = JSON.stringify(finalResumeJson, null, 2); // Pretty print.
      console.log("Background: Sending merged JSON string to popup.");
      return finalJsonString; // Return the complete, merged JSON string.
    } catch (parseError) {
      console.error(
        "Background: ERROR - Failed to parse Gemini JSON output (after cleaning) or merge data:",
        parseError.message,
        "\n--- Cleaned String Attempted ---\n",
        cleanedJsonString.substring(0, 1000) // Log a portion of the problematic string.
      );
      // Throw an error indicating parsing/merging failure.
      throw new Error(`Failed to process API response: ${parseError.message}`);
    }
  } catch (error) {
    // Catch any errors during fetch, processing, or merging.
    console.error(
      "Background: Error during callGeminiApi fetch/processing/merging:",
      error
    );
    // Re-throw a generic error message.
    throw new Error(
      error.message ||
        "Network error or processing/merging failed during API call."
    );
  }
}

// --- Service Worker Lifecycle ---
// Logs when the service worker is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "Basic Resume Tailor (Gemini) Background Service Worker Installed/Updated."
  );
  // Potential place to set default storage values on installation.
});

console.log("Background Service Worker Started (Gemini Configured).");
