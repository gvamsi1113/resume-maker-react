/**
 * @file popupCommunicator.js
 * @description Handles communication from the background script to the extension's popup.
 */

/**
 * Sends a message to the extension's popup UI.
 * If the popup is not open, it will attempt to send the message,
 * and Chrome will often queue it or deliver it if the popup opens soon.
 * Specific errors related to the popup not being open are caught and logged as warnings.
 * Other errors during message sending are logged as errors.
 *
 * @param {object} message - The message object to send. Should have an 'action' property.
 * @param {string} message.action - The type of action or event being communicated.
 * @param {*} [message.data] - Optional data payload for the message.
 * @param {string} [message.message] - Optional descriptive message string.
 * @param {string} [message.textPreview] - Optional text preview for status updates.
 */
export function sendMessageToPopup(message) {
  if (!message || typeof message.action === 'undefined') {
    console.warn("PopupCommunicator: Attempted to send message without an action.", message);
    return; // Don't send malformed messages
  }

  console.log("PopupCommunicator: Sending message to popup:", message.action, message);
  chrome.runtime.sendMessage(message).catch((error) => {
    // These specific errors are common if the popup isn't open and can often be ignored.
    if (
      error.message === "Could not establish connection. Receiving end does not exist." ||
      error.message === "The message port closed before a response was received."
    ) {
      // Log as a warning, as this is an expected scenario if the popup isn't active.
      // console.warn(
      //   `PopupCommunicator: Could not send message (popup likely closed): ${message.action}`,
      //   error.message
      // );
    } else {
      // Log other errors more seriously.
      console.error(
        `PopupCommunicator: Error sending message to popup (Action: ${message.action}):`,
        error
      );
    }
  });
} 