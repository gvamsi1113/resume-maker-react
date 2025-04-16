// background.js - Service worker handling core extension logic: message passing, content script injection, and API calls.

// Imports base resume data (text and structured JSON) from a separate file.
// Un-commenting JSON imports
import {
  // BASE_RESUME, // No longer needed
  // BASE_RESUME_JSON, // No longer needed
  // Import individual JSON chunks instead
  BASE_JSON_BASICS,
  BASE_JSON_SUMMARY, // Assuming summary is separate or handled within promptTemplate
  BASE_JSON_WORK,
  BASE_JSON_EDUCATION,
  BASE_JSON_SKILLS,
  BASE_JSON_PROJECTS,
  // Import others if needed (e.g., certificates, languages)
} from "./baseResumeData.js";

// Removed schema import
// import { jsonSchemaExample } from './jsonSchemaExample.js';
import { generatePrompt } from "./promptTemplate.js"; // Keep this one for now

// --- Debugging Logs ---
console.log("Background: Script attempting to load...");
// Un-commenting logs for JSON imports
console.log("Background: Imported BASE_JSON_BASICS:", BASE_JSON_BASICS);
console.log("Background: Imported BASE_JSON_SUMMARY:", BASE_JSON_SUMMARY);
console.log("Background: Imported BASE_JSON_WORK:", BASE_JSON_WORK);
console.log("Background: Imported BASE_JSON_EDUCATION:", BASE_JSON_EDUCATION);
console.log("Background: Imported BASE_JSON_SKILLS:", BASE_JSON_SKILLS);
console.log("Background: Imported BASE_JSON_PROJECTS:", BASE_JSON_PROJECTS);

console.log("Background: Imported generatePrompt:", typeof generatePrompt);
// --- End Debugging Logs ---

// --- Extension Configuration ---
const GEMINI_MODEL = "gemini-2.5-pro-exp-03-25"; // Specifies the Gemini model to use.
const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models"; // Base URL for the Gemini API.

// --- Base Resume Chunks ---
// These constants hold different sections of the base resume.

// --- Message Listener: Entry point for extension actions ---
// Listens for messages (e.g., from the popup) to trigger the resume generation process.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerGeneration") {
    console.log("Background: Received triggerGeneration");
    sendMessageToPopup({
      action: "statusUpdate",
      message: "Getting selected text...",
    });

    // 1. Get active tab and execute content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const activeTabId = tabs[0].id;

        chrome.scripting
          .executeScript({
            target: { tabId: activeTabId },
            // Ensure content.js path is correct relative to manifest
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
                handleContentScriptResponse(response, sendResponse); // Pass sendResponse for async handling
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

    // Indicate that the response will be sent asynchronously
    return true;
  }
});

// --- Helper: Handles the response received from the content script. ---
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

    // Give feedback about detected text
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
      // Call the LLM (Gemini)
      callGeminiApi(response.text) // Pass the job description text
        .then((generatedJsonString) => {
          // Expecting a JSON string now
          console.log(
            "Background: Gemini API call successful, returning JSON string."
          );
          sendMessageToPopup({
            action: "generationComplete",
            // Send the raw JSON string, popup needs to parse it
            text: generatedJsonString,
          });
          sendResponse({ status: "success", text: generatedJsonString });
        })
        .catch((error) => {
          console.error("Background: Gemini API call failed:", error);
          // Create user-friendly error message
          let userFriendlyError = "Generation Error."; // Default
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
    }, 1000); // Keep delay for UI feedback
  } else {
    // This case might not be reached if content.js always sends success
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

// --- Helper: Handles errors during content script injection. ---
function handleScriptInjectionError(err, sendResponse) {
  console.error("Background: Failed to inject content script:", err);
  sendMessageToPopup({
    action: "error",
    message: "Failed to inject script. Reload page/browser.",
  });
  sendResponse({ status: "error", message: err.message });
}

// --- Helper: Handles errors when the active tab cannot be found. ---
function handleNoActiveTabError(sendResponse) {
  console.error("Background: Could not get active tab.");
  sendMessageToPopup({
    action: "error",
    message: "Could not identify active tab.",
  });
  sendResponse({ status: "error", message: "No active tab found" });
}

// --- Helper: Sends messages (status updates, errors, results) to the popup UI. ---
function sendMessageToPopup(message) {
  console.log("Background: Sending message to popup:", message.action);
  chrome.runtime.sendMessage(message).catch((error) => {
    // Ignore errors if the popup isn't open, but log other unexpected errors
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

// --- Gemini API Interaction: Generates the tailored resume JSON. ---
// Retrieves the API key, constructs the prompt using the job description and imported base resume,
// calls the Gemini API, handles the response (including potential errors and cleaning), and returns the generated JSON string.
async function callGeminiApi(jobDescription) {
  // 1. Retrieve API Key from storage
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

  // 2. Construct the API URL
  const apiUrl = `${GEMINI_API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // --- JSON Schema Example REMOVED ---

  // --- Construct the prompt using imported JSON chunks ---
  const prompt = generatePrompt(
    BASE_JSON_WORK,
    BASE_JSON_SKILLS,
    BASE_JSON_PROJECTS,
    BASE_JSON_SUMMARY,
    jobDescription
  );

  // 4. Construct the Request Body
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      // Ensure JSON output is explicitly requested
      // responseMimeType: "application/json", // Keep this commented unless API supports AND enforces it reliably
      // Temperature and other parameters can be adjusted here if needed
      // temperature: 0.7,
      // topP: 1.0,
      // topK: 40,
      // maxOutputTokens: 8192, // Consider adjusting if responses get truncated
    },
    // Consider stricter safety settings if necessary, but defaults are usually fine
    // safetySettings: [...],
  };

  console.log("Background: Calling Gemini API for tailored sections.");
  // console.log("Background: Prompt Start:", prompt.substring(0, 300)); // Log for debug

  // 5. Make the Fetch Call
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // 6. Handle Non-OK Responses
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
        // Potentially check for other specific errors here (e.g., billing issues)
      } catch (e) {
        errorDetails += ` - Body: ${errorBodyText}`;
      }
      console.error(`Background: API request failed: ${errorDetails}`);
      throw new Error(`API request failed: ${errorDetails}`);
    }

    // 7. Parse Successful Response
    const data = await response.json();

    // Check for candidates
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

    // Check content structure
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

    // Extract text (should be JSON string with summary, work, skills, projects)
    let generatedText = candidate.content.parts[0].text.trim();

    // --- Clean potential markdown fences ---
    const markdownJsonPrefix = "```json";
    const markdownEndFence = "```";
    let cleanedJsonString = generatedText; // Start with the original

    if (cleanedJsonString.startsWith(markdownJsonPrefix)) {
      cleanedJsonString = cleanedJsonString
        .substring(markdownJsonPrefix.length)
        .trimStart(); // Remove prefix and leading whitespace
    } else if (cleanedJsonString.startsWith(markdownEndFence)) {
      // Handle case where only ``` is used
      cleanedJsonString = cleanedJsonString
        .substring(markdownEndFence.length)
        .trimStart();
    }

    if (cleanedJsonString.endsWith(markdownEndFence)) {
      cleanedJsonString = cleanedJsonString
        .substring(0, cleanedJsonString.length - markdownEndFence.length)
        .trimEnd(); // Remove suffix and trailing whitespace
    }
    // --- End cleaning ---

    // *** Parse the CLEANED API response string ***
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

      // --- BEGIN MERGING ---
      const finalResumeJson = {
        basics: BASE_JSON_BASICS.basics, // Add original basics
        ...generatedData, // Add generated summary, work, skills, projects
        education: BASE_JSON_EDUCATION.education, // Add original education
        // You could add BASE_JSON_OTHER here if needed: ...BASE_JSON_OTHER
      };
      // --- END MERGING ---

      // Convert the final merged object back to a JSON string
      const finalJsonString = JSON.stringify(finalResumeJson, null, 2); // Pretty print optional
      console.log("Background: Sending merged JSON string to popup.");
      return finalJsonString; // Return the COMPLETE, merged JSON string
    } catch (parseError) {
      console.error(
        "Background: ERROR - Failed to parse Gemini JSON output (after cleaning) or merge data:",
        parseError.message,
        "\n--- Cleaned String Attempted ---\n",
        cleanedJsonString.substring(0, 1000) // Log more of potentially bad JSON
      );
      // Throw a new error indicating parsing/merging failure
      throw new Error(`Failed to process API response: ${parseError.message}`);
    }
  } catch (error) {
    // Log the full error for debugging
    console.error(
      "Background: Error during callGeminiApi fetch/processing/merging:",
      error
    );
    // Re-throw with a potentially cleaned message
    throw new Error(
      error.message ||
        "Network error or processing/merging failed during API call."
    );
  }
}

// --- Service Worker Initialization ---
// Logs when the service worker is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "Basic Resume Tailor (Gemini) Background Service Worker Installed/Updated."
  );
  // You could potentially set default storage values here if needed
});

console.log("Background Service Worker Started (Gemini Configured).");
