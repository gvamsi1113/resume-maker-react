/**
 * @file Service worker for the Resume Tailor extension.
 * @version 1.0.9
 * @description Handles authentication token management, communication with content scripts
 * and popups, and orchestrates API calls for resume tailoring.
 */

import { callGeminiApi, formatGeminiApiError } from "./modules/geminiApiHandler.js";
import { sendMessageToPopup } from "./modules/popupCommunicator.js";
import { getSelectedTextFromActiveTab } from "./modules/contentScriptManager.js";

console.log("Background script (service_worker) starting up. v1.0.9");

/**
 * Handles incoming messages from other parts of the extension (content scripts, popup).
 * @param {object} request - The message request object.
 * @param {chrome.runtime.MessageSender} sender - Information about the script that sent the message.
 * @param {function(any): void} sendResponse - Function to call to send a response.
 * @returns {boolean|undefined} Returns true if sendResponse will be called asynchronously.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    "BACKGROUND.JS: Message received. Action:", request?.action,
    "Sender ID:", sender?.id,
    "Sender URL:", sender?.url,
    "Sender Tab ID:", sender?.tab?.id
  );

  if (request.action === "storeAuthToken") {
    console.log("Background (storeAuthToken): Handler entered.");
    if (request.token) {
      chrome.storage.local.set({ authToken: request.token }, () => {
        if (chrome.runtime.lastError) {
          console.error("Background (storeAuthToken): Error storing token:", chrome.runtime.lastError.message);
          sendResponse({ status: "error", message: "Failed to store token: " + chrome.runtime.lastError.message });
        } else {
          console.log("Background (storeAuthToken): Auth token stored successfully.");
          sendResponse({ status: "success", message: "Token stored by background script." });
        }
      });
    } else {
      console.error("Background (storeAuthToken): 'storeAuthToken' called without a token.");
      sendResponse({ status: "error", message: "No token provided to storeAuthToken." });
    }
    return true; // Indicates asynchronous sendResponse
  }
  else if (request.action === "clearAuthToken") {
    console.log("Background (clearAuthToken): Handler entered.");
    chrome.storage.local.remove("authToken", () => {
      if (chrome.runtime.lastError) {
        console.error("Background (clearAuthToken): Error clearing token:", chrome.runtime.lastError.message);
        sendResponse({ status: "error", message: "Failed to clear token: " + chrome.runtime.lastError.message });
      } else {
        console.log("Background (clearAuthToken): Auth token cleared successfully.");
        sendResponse({ status: "success", message: "Token cleared by background script." });
      }
    });
    return true; // Indicates asynchronous sendResponse
  }
  else if (request.action === "getAuthToken") {
    console.log("Background (getAuthToken): Handler entered.");
    chrome.storage.local.get("authToken", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Background (getAuthToken): Error retrieving token:", chrome.runtime.lastError.message);
        sendResponse({ status: "error", token: null, message: chrome.runtime.lastError.message });
      } else {
        const tokenExists = !!result.authToken;
        console.log(`Background (getAuthToken): Auth token ${tokenExists ? "retrieved." : "not found."}`);
        sendResponse({ status: "success", token: result.authToken });
      }
    });
    return true; // Indicates asynchronous sendResponse
  }
  else if (request.action === "pingBackground") {
    console.log("Background (pingBackground): Ping received!");
    sendResponse({ status: "pong", message: "Background is alive! (v1.0.9)" });
    // For synchronous sendResponse, returning true is not strictly necessary,
    // but returning undefined (by not having a return) or false is also fine.
    // To be explicit for this synchronous case:
    return;
  }
  else if (request.action === "triggerGeneration") {
    console.log("Background (triggerGeneration): Handler entered.");
    sendMessageToPopup({
      action: "statusUpdate",
      message: "Processing: Getting selected text from page...",
    });

    chrome.storage.local.get("authToken", (authResult) => {
      if (chrome.runtime.lastError) {
        console.error("Background (triggerGeneration): Error getting authToken:", chrome.runtime.lastError);
        sendMessageToPopup({ action: "error", message: "Authentication error. Please try logging in again." });
        sendResponse({ status: "error", message: "Authentication error." });
        return; // Exit from this callback
      }

      const currentToken = authResult.authToken;
      if (!currentToken) {
        console.warn("Background (triggerGeneration): No auth token found. This action might require authentication with your backend.");
        // Consider how to handle this: should it error out or proceed?
        // For now, let's assume Gemini call doesn't strictly need your backend token.
        // If it did, you'd send an error here:
        // sendMessageToPopup({ action: "error", message: "Not authenticated. Please log in via web app." });
        // sendResponse({ status: "error", message: "Not authenticated." });
        // return;
      } else {
        console.log("Background (triggerGeneration): Auth token available for potential backend calls.");
      }

      getSelectedTextFromActiveTab()
        .then((selectionResult) => {
          if (selectionResult && selectionResult.text) {
            console.log("Background (triggerGeneration): Text retrieved:", selectionResult.textPreview);
            sendMessageToPopup({
              action: "statusUpdate",
              message: "Text detected! Preview:",
              textPreview: selectionResult.textPreview,
            });
            setTimeout(() => {
              sendMessageToPopup({
                action: "statusUpdate",
                message: "Generating tailored JSON resume with Gemini...",
              });
              // Pass currentToken to callGeminiApi if it's proxied through your backend
              // e.g., callGeminiApi(selectionResult.text, currentToken)
              callGeminiApi(selectionResult.text)
                .then((generatedJsonString) => {
                  console.log("Background (triggerGeneration): Gemini API call successful.");
                  sendMessageToPopup({ action: "generationComplete", text: generatedJsonString });
                  sendResponse({ status: "success", text: generatedJsonString });
                })
                .catch((error) => {
                  console.error("Background (triggerGeneration): Gemini API call failed:", error);
                  const userFriendlyError = formatGeminiApiError(error);
                  sendMessageToPopup({ action: "error", message: `Gemini Error: ${userFriendlyError}` });
                  sendResponse({ status: "error", message: error.message });
                });
            }, 500);
          } else {
            console.log("Background (triggerGeneration): No text selected or failed to retrieve text.");
            sendResponse({ status: "error", message: "No text selected or failed to retrieve text." });
          }
        })
        .catch((error) => {
          console.error("Background (triggerGeneration): Error in getSelectedTextFromActiveTab chain:", error);
          sendMessageToPopup({ action: "error", message: "Error accessing page content." });
          sendResponse({ status: "error", message: error.message || "Content script manager error." });
        });
    });
    return true; // For the outer chrome.storage.local.get and subsequent async operations
  }
  else {
    console.log("Background: Unhandled message action:", request?.action);
    // No sendResponse() called for unhandled actions, so don't return true.
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  console.log("Resume Tailor Extension installed/updated (v1.0.9). Details:", details);
  if (details.reason === "install") {
    console.log("This is a first install of v1.0.9!");
  } else if (details.reason === "update") {
    console.log("User updated to v1.0.9 of this extension.");
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Resume Tailor Extension started via onStartup (v1.0.9).");
});

console.log("Background script (v1.0.9) fully loaded and all listeners attached.");