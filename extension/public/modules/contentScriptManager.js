/**
 * @file contentScriptManager.js
 * @description Manages the injection of and communication with content scripts.
 */
import { sendMessageToPopup } from "./popupCommunicator.js";
import {
  handleScriptInjectionError as globalHandleScriptInjectionError,
  handleNoActiveTabError as globalHandleNoActiveTabError,
  handleContentScriptError as globalHandleContentScriptError,
} from "./errorHandler.js";

const CONTENT_SCRIPT_FILE = "content.js";

/**
 * Injects the content script into the active tab and retrieves selected text.
 * Handles errors related to tab querying, script injection, and message passing.
 *
 * @returns {Promise<{text: string, textPreview: string} | null>} A promise that resolves with the selected text
 *                                                               and its preview, or null if an error occurs.
 *                                                               The promise is designed to not reject directly
 *                                                               but to allow the caller to check the result.
 */
export function getSelectedTextFromActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const activeTabId = tabs[0].id;

        chrome.scripting
          .executeScript({
            target: { tabId: activeTabId },
            files: [CONTENT_SCRIPT_FILE],
          })
          .then(() => {
            console.log(
              "ContentScriptManager: Injected/confirmed content script. Sending message to get selection."
            );
            chrome.tabs.sendMessage(
              activeTabId,
              { action: "getSelection" },
              (response) => {
                if (chrome.runtime.lastError) {
                  globalHandleContentScriptError(
                    "Error in response from content script.",
                    chrome.runtime.lastError
                    // No sendResponse here, handled by promise rejection
                  );
                  resolve(null); // Resolve with null to indicate failure
                  return;
                }

                if (response && response.status === "success" && response.text) {
                  console.log("ContentScriptManager: Received selected text.");
                  resolve({
                    text: response.text,
                    textPreview: response.textPreview ||
                                 response.text.substring(0, 100) +
                                 (response.text.length > 100 ? "..." : ""),
                  });
                } else {
                  const errorMessage =
                    response?.message ||
                    (!response?.text
                      ? "No text selected on the page."
                      : "Failed to get selection from page.");
                  globalHandleContentScriptError(errorMessage);
                  resolve(null); // Resolve with null to indicate failure
                }
              }
            );
          })
          .catch((err) => {
            globalHandleScriptInjectionError(err, () => resolve(null)); // Pass a dummy sendResponse that resolves
          });
      } else {
        globalHandleNoActiveTabError(() => resolve(null)); // Pass a dummy sendResponse that resolves
      }
    });
  });
} 