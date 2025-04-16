// content.js - Injected into web pages to interact with the DOM.

/**
 * Listens for messages from the background script.
 * Primarily handles the "getSelection" action to retrieve user-selected text.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    // Get the currently selected text on the page and trim whitespace.
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      // Create a truncated version for logging (first 100 chars)
      const truncatedText =
        selectedText.length > 100
          ? selectedText.substring(0, 100) + "..."
          : selectedText;

      console.log("Content Script: Detected text selection:", truncatedText);
      sendResponse({
        status: "success",
        text: selectedText,
        textPreview: truncatedText, // Send a preview for display
      });
    } else {
      console.log("Content Script: No text selected.");
      // Send a success response even if no text is selected, indicating the check was performed.
      sendResponse({
        status: "success",
        text: "",
        textPreview: "[No text selected]",
      });
    }
  }
  // Return true to indicate that the response will be sent asynchronously.
  return true;
});

// Log to the console to confirm the content script has loaded successfully.
console.log("Resume Tailor Content Script Loaded.");
