/**
 * @file errorHandler.js
 * @description Centralized error handling utilities for the extension's background script.
 */
import { sendMessageToPopup } from "./popupCommunicator.js";

/**
 * Handles errors that occur during content script injection.
 * Sends an error message to the popup and logs the error to the console.
 *
 * @param {Error} error - The error object from the script injection attempt.
 * @param {function} sendResponse - The `sendResponse` callback from the message listener,
 *                                  to signal completion or error to the message sender.
 */
export function handleScriptInjectionError(error, sendResponse) {
  console.error("ErrorHandler: Failed to inject content script:", error);
  sendMessageToPopup({
    action: "error",
    message: "Failed to inject script. Reload page/browser.",
  });
  if (typeof sendResponse === 'function') {
    sendResponse({ status: "error", message: error.message });
  } else {
    console.warn("ErrorHandler: sendResponse was not a function in handleScriptInjectionError");
  }
}

/**
 * Handles errors when the active tab cannot be found or identified.
 * Sends an error message to the popup and logs the error to the console.
 *
 * @param {function} sendResponse - The `sendResponse` callback from the message listener,
 *                                  to signal completion or error to the message sender.
 */
export function handleNoActiveTabError(sendResponse) {
  console.error("ErrorHandler: Could not get active tab.");
  sendMessageToPopup({
    action: "error",
    message: "Could not identify active tab.",
  });
  if (typeof sendResponse === 'function') {
    sendResponse({ status: "error", message: "No active tab found" });
  } else {
    console.warn("ErrorHandler: sendResponse was not a function in handleNoActiveTabError");
  }
}

/**
 * Handles errors related to content script communication or operations.
 * Sends an error message to the popup and logs the error to the console.
 *
 * @param {string} errorMessage - A descriptive error message.
 * @param {Error} [errorObject] - Optional error object for more detailed logging.
 * @param {function} [sendResponse] - Optional `sendResponse` callback from a message listener.
 */
export function handleContentScriptError(errorMessage, errorObject, sendResponse) {
  console.error("ErrorHandler: Content script error - ", errorMessage, errorObject || '');
  sendMessageToPopup({ action: "error", message: errorMessage });
  if (typeof sendResponse === 'function') {
    sendResponse({ status: "error", message: errorObject?.message || errorMessage });
  }
} 