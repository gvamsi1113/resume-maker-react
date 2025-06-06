var TextSelection = {
  /**
   * Retrieves the currently selected text from the page.
   * @returns {{text: string, textPreview: string}} An object containing the full selected text
   * and a truncated preview.
   */
  getSelectedText: function() {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      const truncatedText =
        selectedText.length > 100
          ? selectedText.substring(0, 100) + "..."
          : selectedText;
      console.log("Content Script (getSelectedText): Detected text selection:", truncatedText);
      return { text: selectedText, textPreview: truncatedText };
    } else {
      console.log("Content Script (getSelectedText): No text selected.");
      return { text: "", textPreview: "[No text selected]" };
    }
  }
}; 