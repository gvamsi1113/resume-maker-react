var JobScrapingHelpers = {
  /**
   * Checks if the current page looks like a job posting page we support.
   * This is a placeholder - you'll need to make this more robust for specific sites.
   * @returns {boolean}
   */
  isJobPostingPage: function() {
    // EXAMPLE 1: Check for a specific element ID common on job pages you target
    // const jobDescElement = document.getElementById('job-details') || document.querySelector('.job-description-main');
    // if (jobDescElement) {
    //   console.log("Content Script (isJobPostingPage): Detected job page by specific element.");
    //   return true;
    // }

    // EXAMPLE 2: Check URL patterns (make these more specific)
    const href = window.location.href;

    // LinkedIn: More specific check for job view pages or pages with a currentJobId parameter.
    const isLinkedInJobPage = href.includes("linkedin.com/jobs/view/") ||
                            (href.includes("linkedin.com/jobs/") && href.includes("currentJobId="));

    // Indeed and Glassdoor checks remain the same
    const isIndeedJobPage = href.includes("indeed.com/viewjob");
    const isGlassdoorJobPage = href.includes("glassdoor.com/Job/"); // Note: Glassdoor URLs can be complex

    if (isLinkedInJobPage || isIndeedJobPage || isGlassdoorJobPage) {
      console.log("Content Script (isJobPostingPage): Detected job page by URL pattern for:", href);
      return true;
    }

    // Add more sophisticated checks if needed. For now, a console log for non-matches.
    // console.log("Content Script (isJobPostingPage): Current page does not appear to be a recognized job posting page.");
    return false;
  },

  /**
   * Helper function to try multiple selectors and return the content of the first match.
   * @param {string[]} selectors - Array of CSS selectors to try.
   * @param {function(HTMLElement): string} extractor - Function to extract content from the found element.
   * @returns {string} The extracted content or 'N/A'.
   */
  scrapeFirstMatch: function(selectors, extractor) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        try {
          return extractor(element);
        } catch (e) {
          console.warn(`Error extracting from selector "${selector}":`, e);
        }
      }
    }
    return 'N/A';
  }
}; 