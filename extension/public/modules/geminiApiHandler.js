import { generatePrompt } from "../data/promptTemplate.js";
import {
  BASE_RESUME_SUMMARY,
  BASE_RESUME_WORK,
  BASE_RESUME_SKILLS,
  BASE_RESUME_PROJECTS,
} from "../data/baseResumeData.js";

const GEMINI_MODEL = "gemini-2.5-pro-exp-03-25";
const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Retrieves the Gemini API Key from local storage.
 * @async
 * @throws {Error} If the API key is not found or cannot be retrieved.
 * @returns {Promise<string>} The Gemini API key.
 */
async function getApiKey() {
  try {
    const data = await chrome.storage.local.get(["geminiApiKey"]);
    if (!data.geminiApiKey) {
      throw new Error(
        "Gemini API Key not found. Please set it via the extension's console or options page."
      );
    }
    return data.geminiApiKey;
  } catch (error) {
    console.error("GeminiAPIHandler: Error retrieving API key:", error);
    throw new Error(error.message || "Could not retrieve API key.");
  }
}

/**
 * Calls the Gemini API to generate a tailored resume JSON based on the job description.
 * @async
 * @param {string} jobDescription - The job description text.
 * @throws {Error} If the API call fails or returns an error.
 * @returns {Promise<string>} A promise that resolves with the generated JSON string.
 */
export async function callGeminiApi(jobDescription) {
  let apiKey;
  try {
    apiKey = await getApiKey();
  } catch (error) {
    // Propagate the error to be handled by the caller, which will inform the user.
    throw error;
  }

  const apiUrl = `${GEMINI_API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const prompt = generatePrompt(
    BASE_RESUME_WORK,
    BASE_RESUME_SKILLS,
    BASE_RESUME_PROJECTS,
    BASE_RESUME_SUMMARY,
    jobDescription
  );

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      // Ensure a consistent JSON output structure
      response_mime_type: "application/json",
      temperature: 0.2, // Lower temperature for more deterministic, less "creative" output
      topP: 0.8,
      topK: 10,
    },
    safetySettings: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
        },
        {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
        },
        {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
        }
    ]
  };

  console.log(
    "GeminiAPIHandler: Sending request to Gemini API. URL:",
    apiUrl,
    "Prompt:",
    prompt.substring(0, 200) + "..." // Log a snippet of the prompt
  );

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Try to get more error details
      console.error(
        `GeminiAPIHandler: API request failed with status ${response.status}:`,
        errorBody
      );
      throw new Error(
        `API request failed with status ${response.status}. Details: ${errorBody}`
      );
    }

    const responseData = await response.json();
    console.log("GeminiAPIHandler: Received response from API:", responseData);

    if (
      !responseData.candidates ||
      !responseData.candidates[0] ||
      !responseData.candidates[0].content ||
      !responseData.candidates[0].content.parts ||
      !responseData.candidates[0].content.parts[0] ||
      !responseData.candidates[0].content.parts[0].text
    ) {
      console.error(
        "GeminiAPIHandler: Invalid or empty response structure from API:",
        responseData
      );
      if(responseData.promptFeedback && responseData.promptFeedback.blockReason) {
        throw new Error(`Content blocked by API due to: ${responseData.promptFeedback.blockReason}. Details: ${JSON.stringify(responseData.promptFeedback.safetyRatings)}`);
      }
      throw new Error("API returned an invalid or empty response structure.");
    }

    const generatedText = responseData.candidates[0].content.parts[0].text;

    // Basic validation: Check if the generated text looks like a JSON string.
    // A more robust validation would involve trying to parse it and checking against a schema.
    if (!generatedText.trim().startsWith("{") || !generatedText.trim().endsWith("}")) {
        console.warn("GeminiAPIHandler: Generated text does not appear to be a valid JSON object. Text:", generatedText);
        // Depending on strictness, you might throw an error here or try to clean it.
        // For now, we'll let it pass and the popup can try to parse it.
        // Consider adding a cleanup function if this becomes a frequent issue.
    }

    return generatedText; // This should be the JSON string.
  } catch (error) {
    console.error("GeminiAPIHandler: Error during Gemini API call:", error);
    // Re-throw the error so it can be caught by the calling function (in background.js or its new module)
    // This allows the caller to update the UI with a specific error message.
    throw new Error(error.message || "An unexpected error occurred during the API call.");
  }
}

/**
 * Formats a Gemini API error for user display.
 * @param {Error} error - The error object from the Gemini API call.
 * @returns {string} A user-friendly error message.
 */
export function formatGeminiApiError(error) {
  let userFriendlyError = "Generation Error."; // Default message
  const errorMessage = error.message || "";

  if (errorMessage.includes("API Key not found") || errorMessage.includes("API key not valid")) {
    userFriendlyError = "Invalid or missing API Key.";
  } else if (errorMessage.includes("API request failed")) {
    userFriendlyError = "API Request Failed.";
  } else if (errorMessage.includes("valid JSON")) {
    userFriendlyError = "Failed to generate valid JSON.";
  } else if (errorMessage.includes("safety") || errorMessage.includes("Content blocked")) {
    userFriendlyError = "Content blocked (safety).";
  } else if (errorMessage.includes("quota")) {
    userFriendlyError = "API Quota Exceeded.";
  } else if (errorMessage.includes("empty response")) {
    userFriendlyError = "API returned empty response.";
  } else if (errorMessage.includes("NetworkError") || errorMessage.includes("fetch")) {
    userFriendlyError = "Network error. Check connection.";
  }
  return `${userFriendlyError} (Details: ${errorMessage.substring(0,150)}${errorMessage.length > 150 ? '...' : ''})`;
} 