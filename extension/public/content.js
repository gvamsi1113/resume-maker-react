// extension/content.js (or your source location)

console.log("Resume Tailor Content Script Loaded (v1.1.1 - includes job scraping features)");

// Initialize the job scraping feature after defining all functions
JobScraping.initialize();

// The original file had a commented out message listener section. 
// That has been removed for clarity as it wasn't being used.
// If a message listener is needed (e.g., for getSelectedText), it could be added here, like so:
/*
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    // Assuming TextSelection module is loaded.
    sendResponse(TextSelection.getSelectedText());
    return true; // To indicate you wish to send a response asynchronously
  }
});
*/