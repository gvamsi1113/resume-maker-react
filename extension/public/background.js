// background.js - Service worker handling core extension logic: message passing, content script injection, and API calls.

// Imports base resume data (text and structured JSON) from a separate file.
import {
  BASE_RESUME,
  BASE_RESUME_JSON, // If you need the combined JSON object
  // You can import individual JSON chunks if needed, e.g.:
  // BASE_JSON_BASICS,
  // BASE_JSON_SUMMARY,
  // etc.
} from "./baseResumeData.js";

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

  // --- Define the JSON Schema Example ---
  // Note: This schema should ideally match the ResumeData interface in types/resumeTypes.ts
  const jsonSchemaExample = `{
    "basics": {
        "name": "",
        "label": "",
        "email": "",
        "phone": "",
        "url": "",
        "location": { "city": "", "region": "" },
        "profiles": [ { "network": "", "username": "", "url": "" } ],
        "summary": ""
    },
    "work": [
        {
            "name": "Company",
            "position": "Title",
            "url": "",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM or Present",
            "story": null,
            "highlights": []
        }
    ],
    "education": [
        {
            "institution": "",
            "area": "",
            "studyType": "",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM or Present",
            "gpa": ""
        }
    ],
    "skills": [
        {
            "name": "Category",
            "keywords": []
        }
    ],
    "projects": [
        {
            "name": "Project Name",
            "description": "",
            "url": "",
            "keywords": []
        }
    ],
    "certificates": [],
    "languages": []
}`;

  // --- Construct the NEW STRICTER Prompt ---
  const prompt = `IMPERATIVE: YOUR SOLE FUNCTION IS TO ACT AS A JSON API ENDPOINT. YOU MUST OUTPUT A SINGLE, VALID JSON OBJECT AND NOTHING ELSE. ABSOLUTELY NO MARKDOWN, EXPLANATIONS, OR ANY TEXT BEFORE THE STARTING '{' OR AFTER THE ENDING '}' IS PERMITTED.

**TASK:**

Parse the provided \`BASE RESUME\` and \`JOB DESCRIPTION\`. Generate a single JSON object conforming *EXACTLY* to the structure defined in the \`--- JSON SCHEMA EXAMPLE ---.\`

**STRICT RULES:**

1.  **Input Processing:**
    *   Thoroughly parse the \`BASE RESUME\` to extract all available information.
    *   Thoroughly analyze the \`JOB DESCRIPTION\` to identify keywords, required skills, technologies, if company is mentioned use their company principles, and desired experience patterns.

2.  **Output Format:**
    *   The *entire* output MUST be a single, valid JSON object.
    *   The JSON object MUST strictly adhere to the schema provided in \`--- JSON SCHEMA EXAMPLE ---.\`
    *   There must be nothing else except the JSON object. NO text, commentary, or markdown formatting preceding the opening \`{\` or succeeding the closing \`}\`.

3.  **Content - Non-Tailored Sections:**
    *   Populate fields derived *directly* from the \`BASE RESUME\` that are *not* explicitly listed for tailoring in Rule 4 (e.g., \`basics.name\`, \`basics.email\`, \`education\`, \`certificates\`, \`languages\` IF they exist in the schema).
    *   Ensure \`work\`, \`education\`, and \`certificates\` arrays (if present in the schema) are ordered reverse chronologically (most recent first).

4.  **Content - Tailored Sections (MANDATORY FOCUS):**
    *   Modify *only* the following JSON fields based *strictly* on the \`JOB DESCRIPTION\` analysis. The goal is maximum alignment with the target role.
        *   \`basics.summary\`:
            *   **Length:** 3 concise lines ONLY.
            *   **Content:** A targeted pitch highlighting suitability for the *specific role* described in the \`JOB DESCRIPTION\`, using keywords from it.
        *   \`work[].highlights\`:
            *   **Quantity:** 4-6 bullet points per work entry.
            *   **Structure:** MUST follow Action Verb -> Specific Task/Accomplishment -> Quantifiable Result (Metric).
            *   **Action Verbs:** Every bullet point MUST begin with a strong action verb (e.g., Led, Developed, Implemented, Optimized, Reduced, Managed, Created, Automated).
            *   **Quantify Everything:** MUST include specific, relevant metrics wherever possible. Use numbers (e.g., "Reduced API latency by 30%", "Managed budget of $500K", "Increased user engagement by 15%", "Processed 10K records daily"). Ensure metrics are practical and common for the achievement described.
            *   **Tailoring (Keywords):** Each bullet MUST directly address skills, technologies, or responsibilities mentioned in the \`JOB DESCRIPTION\`. Prioritize keywords heavily.
            *   **Conciseness (VERY IMPORTANT):** Bullet points MUST be brief. Strictly either 1 line (10 - 12 words strict) or 2 lines (25-27 words strict) nothing in between. Mostly 2 lines each bullet. DO NOT EXCEED 2 LINES PER BULLET DO NOT BE OUT OF RANGE OF THE WORDS COUNT PER BULLET.
            *   **Objectivity:** STRICTLY NO first-person ("I", "me", "my", "we", "our"). Maintain an impersonal, objective tone.
            *   **No Fluff:** STRICTLY NO adverbs (e.g., successfully, effectively, efficiently, very) or vague filler words. Be direct and factual.
        *   \`projects[].description\` (If schema includes it):
            *   **Content:** Tailor the description to highlight aspects relevant to the \`JOB DESCRIPTION\`. Mention the tech stack used (especially if it aligns with JD requirements) and the project's impact or purpose in relation to the target role.

5.  **Skills Section (\`skills\`):**
    *   **Content:** Extract *only hard skills* (technical skills, tools, languages, frameworks, methodologies) from the \`BASE RESUME\`.
    *   **Enhancement:** Add/emphasize hard skills, tools, and technologies explicitly mentioned in the \`JOB DESCRIPTION\`. If a skill from the JD is present in the base resume, ensure it's prominent. If it's missing, add it. DO NOT add any fluff, just the skill, no skill level reference required. DO NOT add words like exposure, expert etc.
    *   **Categorization:** Group skills logically (e.g., "Frontend", "Backend", "Databases", "Cloud", "Methodologies").

6.  **Keyword and Technology Integration (CRITICAL):**
    *   Actively identify *all* keywords, tools, and technologies present in the \`JOB DESCRIPTION\`.
    *   Strategically and *cleverly* integrate these terms into the tailored sections (\`basics.summary\`, \`work[].highlights\`, \`projects[].description\`, \`skills\`).
    *   **Placement Strategy:** Place keywords where they logically fit. For example, if the JD requires "Kubernetes" and a past project involved cloud deployment, add a highlight like "Deployed microservices using Docker and Kubernetes, achieving 99.9% uptime.". make sure you follow the word count. Group related technologies mentioned in the JD within relevant bullet points or project descriptions.

7.  **Company Principles Integration (If Applicable):**
    *   If the \`JOB DESCRIPTION\` or common knowledge indicates specific company principles (e.g., Amazon Leadership Principles, Google's values), subtly weave demonstrations of these principles into the content of \`basics.summary\`, \`work[].highlights\`, and \`projects[].description\`.
    *   **Subtlety is Key:** Do not explicitly name the principle. Instead, show it through actions and results (e.g., for "Customer Obsession," write a highlight focused on improving user experience based on feedback; for "Bias for Action," describe rapidly implementing a solution). Spread these references naturally across the relevant sections.

8.  **Exclusion Focus:**
    *   Direct tailoring efforts *primarily* towards \`basics.summary\`, \`work\`, \`projects\`, and \`skills\`.
    *   Do *not* spend effort tailoring static or less relevant sections like \`education\`, \`certificates\`, \`languages\`, or \`basics\` fields other than \`summary\`, unless the schema *requires* specific formatting not present in the base resume. Populate these from the base resume as-is (maintaining reverse chronological order where applicable).

9.  **Final Output Constraint (ABSOLUTE):** The final response MUST begin *exactly* with \`{\` and end *exactly* with \`}\`. No other characters, formatting, markdown, or explanations are allowed.

**FINAL CRITICAL CHECK:** Before generating the JSON, double-check EVERY bullet point in ALL \`work[].highlights\` arrays. EACH bullet MUST contain EXACTLY 10, 11, or 12 words OR EXACTLY 25, 26, or 27 words. NO OTHER LENGTH IS PERMITTED. THIS IS A MANDATORY REQUIREMENT.

--- JSON SCHEMA EXAMPLE ---
\`\`\`json
${jsonSchemaExample}
\`\`\`

--- BASE RESUME ---
${BASE_RESUME}

--- JOB DESCRIPTION ---
${jobDescription}

--- TAILORED RESUME JSON OUTPUT ---`; // No extra text after this marker

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

  console.log("Background: Calling Gemini API with STRICT prompt.");
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

    // Extract text (should be JSON string)
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

    // *** Attempt JSON Validation on the CLEANED string ***
    try {
      if (!cleanedJsonString) {
        // Still treat empty response as an error condition before returning
        throw new Error(
          "API returned an empty or markdown-only response string."
        );
      }
      // Attempt to parse the CLEANED string to check validity for logging purposes
      JSON.parse(cleanedJsonString);
      console.log(
        "Background: Received and successfully cleaned VALID JSON string from Gemini."
      );
    } catch (parseError) {
      console.error(
        "Background: WARNING - Gemini output (after cleaning) was NOT valid JSON:",
        parseError.message,
        "\n--- Cleaned String Start ---\n",
        cleanedJsonString.substring(0, 500), // Log beginning of potentially bad CLEANED output
        "\n--- Cleaned String End ---\n",
        "\n--- Original Raw Output ---\n",
        generatedText.substring(0, 500) // Also log original raw output for comparison
      );
      // Log the error, but DO NOT throw. We will return the potentially problematic cleaned text anyway.
    }

    // Always return the CLEANED generated text string, letting the popup handle final parsing
    console.log(
      "Background: Sending potentially cleaned generated text string to popup."
    );
    return cleanedJsonString;
  } catch (error) {
    // Log the full error for debugging
    console.error(
      "Background: Error during callGeminiApi fetch/processing:",
      error
    );
    // Re-throw with a potentially cleaned message
    throw new Error(
      error.message || "Network error or processing failed during API call."
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
