/**
 * @file background.js
 * @description Service worker for the Resume Tailor extension.
 * Orchestrates fetching selected text from the active tab, calling the Gemini API
 * for resume tailoring, and communicating status/results to the popup.
 */

import { callGeminiApi, formatGeminiApiError } from "./modules/geminiApiHandler.js";
import { sendMessageToPopup } from "./modules/popupCommunicator.js";
import { getSelectedTextFromActiveTab } from "./modules/contentScriptManager.js";

// --- Main Message Listener ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerGeneration") {
    console.log("Background: Received triggerGeneration action.");
    sendMessageToPopup({
      action: "statusUpdate",
      message: "Processing: Getting selected text from page...",
    });

    getSelectedTextFromActiveTab()
      .then((selectionResult) => {
        if (selectionResult && selectionResult.text) {
          console.log("Background: Successfully retrieved text from content script.");
          sendMessageToPopup({
            action: "statusUpdate",
            message: "Text detected! Preview:",
            textPreview: selectionResult.textPreview,
          });

          // Short delay for UI to update before API call message
          setTimeout(() => {
            sendMessageToPopup({
              action: "statusUpdate",
              message: "Generating tailored JSON resume with Gemini...",
            });

            callGeminiApi(selectionResult.text)
              .then((generatedJsonString) => {
                console.log(
                  "Background: Gemini API call successful. Sending to popup."
                );
                sendMessageToPopup({
                  action: "generationComplete",
                  text: generatedJsonString, // Raw JSON string for popup to parse
                });
                sendResponse({ status: "success", text: generatedJsonString });
              })
              .catch((error) => {
                console.error("Background: Gemini API call failed:", error);
                const userFriendlyError = formatGeminiApiError(error);
                sendMessageToPopup({
                  action: "error",
                  message: `Gemini Error: ${userFriendlyError}`,
                });
                // It's important to still call sendResponse for the original message listener
                sendResponse({ status: "error", message: error.message });
              });
          }, 500); // Small delay for status update visibility
        } else {
          // Error messages to popup are handled by getSelectedTextFromActiveTab via errorHandler
          console.log(
            "Background: Failed to get text from content script or no text selected."
          );
          // Ensure sendResponse is called if getSelectedTextFromActiveTab resolves with null/failure
          sendResponse({
            status: "error",
            message: "Failed to retrieve text from page. No text selected or script error.",
          });
        }
      })
      .catch((error) => {
        // This catch is for unexpected errors in getSelectedTextFromActiveTab promise itself,
        // though it's designed to resolve with null rather than reject for known issues.
        console.error(
          "Background: Unexpected error in getSelectedTextFromActiveTab promise chain:",
          error
        );
        sendMessageToPopup({
          action: "error",
          message: "An unexpected error occurred while accessing page content.",
        });
        sendResponse({
          status: "error",
          message: error.message || "Unexpected content script manager error",
        });
      });

    return true; // Indicate that sendResponse will be called asynchronously.
  }
  // If the message action is not 'triggerGeneration', and not handled otherwise,
  // it's good practice to return false or nothing if not intending to send a response.
  // return false; // For synchronous message handlers or if this action isn't handled.
});

// --- Service Worker Lifecycle Events ---
chrome.runtime.onInstalled.addListener(() => {
  console.log("Resume Tailor Extension installed/updated.");
  // Future: Set up default API key or guide user to options page.
  // chrome.storage.local.get("geminiApiKey", (result) => {
  //   if (!result.geminiApiKey) {
  //     sendMessageToPopup({
  //       action: "statusUpdate",
  //       message: "API Key needed. Please set it in extension options."
  //     });
  //   }
  // });
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Resume Tailor Extension started.");
});

// --- Removed legacy code ---
// The old handleContentScriptResponse and other specific handlers
// have been integrated into or replaced by the new modular structure.

// /**
//  * Handles the response received from the content script.
//  * Processes the selected text, updates the popup status,
//  * and triggers the Gemini API call.
//  * @param {object} response - The response object from the content script.
//  * @param {function} sendResponse - Callback function to send a response to the original message sender.
//  * @param {number} tabId - The ID of the tab from which the content script responded.
//  */
// function handleContentScriptResponse(response, sendResponse, tabId) { ... } // Moved to errorHandler.js

// /**
//  * Handles errors that occur during content script injection.
//  * @param {Error} err - The error object.
//  * @param {function} sendResponse - Callback function to send an error response.
//  */
// function handleScriptInjectionError(err, sendResponse) { ... } // Moved to errorHandler.js

// /**
//  * Handles errors when the active tab cannot be found.
//  * @param {function} sendResponse - Callback function to send an error response.
//  */
// function handleNoActiveTabError(sendResponse) { ... } // Moved to errorHandler.js

// /**
//  * Sends messages (status updates, errors, results) to the popup UI.
//  * @param {object} message - The message object to send.
//  */
// function sendMessageToPopup(message) { ... } // Moved

// /**
//  * Calls the Gemini API to generate a tailored resume JSON based on the job description.
//  * Retrieves the API key, constructs the prompt, makes the API call,
//  * handles the response (including cleaning and merging), and returns the final JSON string.
//  * @param {string} jobDescription - The job description text from the content script.
//  * @returns {Promise<string>} A promise that resolves with the generated JSON string.
//  */
// async function callGeminiApi(jobDescription) { ... } // Moved

// /**
//  * Merges the generated resume data with the base resume data.
//  * @param {object} generatedData - The resume data generated by the Gemini API.
//  * @returns {object} The merged resume data.
//  */
// function mergeWithBaseResume(generatedData) { ... } // This function was complex and potentially problematic. Simplified by having Gemini return full structure.

// /**
//  * Cleans the JSON string received from the Gemini API.
//  * Removes markdown formatting and ensures it's a valid JSON string.
//  * @param {string} jsonString - The JSON string from the API.
//  * @returns {string} The cleaned JSON string.
//  * @throws {Error} If the string cannot be cleaned into valid JSON.
//  */
// function cleanGeminiJson(jsonString) { ... } // Moved to be part of API response handling or parsing logic if still needed.
