// content.js - Runs in the context of the web page

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    const selectedText = window.getSelection().toString().trim(); // Trim whitespace
    if (selectedText) {
      // Create a truncated version for logging (first 100 chars)
      const truncatedText =
        selectedText.length > 100
          ? selectedText.substring(0, 100) + "..."
          : selectedText;

      console.log("Content Script: DETECTED TEXT SELECTION:", truncatedText);
      sendResponse({
        status: "success",
        text: selectedText,
        textPreview: truncatedText, // Send a preview for display
      });
    } else {
      console.log("Content Script: NO TEXT SELECTED - Selection is empty.");
      // Send success but with empty text, background can handle it
      sendResponse({
        status: "success",
        text: "",
        textPreview: "[NO TEXT SELECTED]",
      });
    }
  }
  // Keep the message channel open for the asynchronous response
  return true;
});

// Add a visible log to confirm loading for debugging
console.log("Resume Tailor Content Script Loaded and Ready to Detect Text.");
