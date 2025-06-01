// content.js - Injected into web pages to interact with the DOM.

/**
 * Retrieves the currently selected text from the page.
 * @returns {{text: string, textPreview: string}} An object containing the full selected text
 *                                                and a truncated preview.
 */
function getSelectedText() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    const truncatedText =
      selectedText.length > 100
        ? selectedText.substring(0, 100) + "..."
        : selectedText;
    console.log("Content Script: Detected text selection:", truncatedText);
    return { text: selectedText, textPreview: truncatedText };
  } else {
    console.log("Content Script: No text selected.");
    return { text: "", textPreview: "[No text selected]" };
  }
}

/**
 * Listens for messages from the background script.
 * Primarily handles the "getSelection" action to retrieve user-selected text.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    const selection = getSelectedText();
    sendResponse({
      status: "success", // Always success, as the action is to attempt to get text
      text: selection.text,
      textPreview: selection.textPreview,
    });
  }
  // Return true to indicate that the response will be sent asynchronously if sendResponse is called in a callback.
  // In this case, sendResponse is called synchronously within the listener, but returning true is a good practice
  // for message listeners that might become asynchronous later.
  return true;
});

// Log to the console to confirm the content script has loaded successfully.
console.log("Resume Tailor Content Script Loaded.");
