var JobScraping = {
  /**
   * Handles the click event for the injected "Tailor with ResumeBuilder" button.
   */
  handleTailorButtonClick: function(event) {
    event.preventDefault(); // Prevent default action if the button is inside a form
    event.stopPropagation(); // Stop the click from bubbling up to other elements

    console.log("Content Script: 'Tailor with AI' button clicked!");

    // --- Basic Scraping Logic ---
    // **IMPORTANT**: These selectors are EXAMPLES and MUST be adapted for each target site.
    // It's better to make these more robust and specific.
    const jobTitleSelectors = [
      '.job-details-jobs-unified-top-card__job-title h1', // New LinkedIn Selector
      '.jobsearch-JobInfoHeader-title',
      '.topcard__title',
      '.job-title',
      '.jobTitle'
    ];
    const companyNameSelectors = [
      '.job-details-jobs-unified-top-card__company-name a', // New LinkedIn Selector
      '.jobsearch-InlineCompanyRating-companyHeader',
      '.topcard__org-name-link',
      '.employer-name',
      '.company-name',
      'a[data-tn-element="companyName"]',
      'div[data-company-name="true"]'
    ];
    const jobDescriptionSelectors = [
      '#job-details', // New LinkedIn Selector
      '.jobs-description-content__text--stretch', // New LinkedIn Selector Fallback
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',
      '.jobs-description__content',
      '.jobDescription',
      '.job-details__main-content',
      '.jobad-primary-details-module__description-text'
    ];

    let jobDetails = {
      title: JobScrapingHelpers.scrapeFirstMatch(jobTitleSelectors, el => el.innerText.trim()),
      company: JobScrapingHelpers.scrapeFirstMatch(companyNameSelectors, el => el.innerText.trim()),
      description: JobScrapingHelpers.scrapeFirstMatch(jobDescriptionSelectors, el => el.innerText.trim()),
      url: window.location.href
    };

    console.log("Content Script (handleTailorButtonClick): Scraped Job Details:", jobDetails);

    if (jobDetails.title === 'N/A' && jobDetails.description === 'N/A') {
      alert("Could not scrape job details. Please ensure you are on a job posting page and the selectors are configured for this site.");
      return;
    }

    // Send scraped data to the background script to be processed.
    console.log("Content Script: Sending scraped data to background script.", jobDetails);
    chrome.runtime.sendMessage({
      action: "jobDataScraped",
      data: jobDetails
    }, response => {
      if (chrome.runtime.lastError) {
        console.error("Error sending scraped job data:", chrome.runtime.lastError.message);
        // Optionally, inform the user that something went wrong.
        alert("There was an error sending the job details to the extension. Please try again.");
      } else {
        console.log("Scraped job data sent to background. Response:", response);
        // The background script will open a new tab, so nothing more to do here.
        // You could potentially show a temporary "Sent!" message on the page.
      }
    });
  },

  /**
   * Creates and injects the "Tailor with ResumeBuilder" button.
   */
  injectTailorButton: function() {
    // **IMPORTANT**: You MUST adapt these selectors for the target job site(s).
    // These are very generic examples and will likely NOT work on real sites without adjustment.
    let targetElement =
      document.querySelector('.jobs-apply-button') || // LinkedIn new
      document.querySelector('[data-job-id] .jobs-s-apply__button') || // LinkedIn old
      document.querySelector('#applyButton_feature_div') || // Indeed
      document.querySelector('.applyButton-button') || // Glassdoor
      document.querySelector('button[data-control-name="jobdetails_apply_button"]'); // Another LinkedIn variant

    let injectionParentElement;

    if (targetElement) {
      // Try to find a good parent container for better layout control
      injectionParentElement = targetElement.closest('div:not([class*="tooltip"])') || targetElement.parentElement;
      console.log("Content Script (injectTailorButton): Found target element to inject near:", targetElement);
    } else {
      console.warn("Content Script (injectTailorButton): Could not find a primary target element to inject the button near.");
      // As a last resort, if no specific target, don't inject, or pick a very generic spot (less ideal)
      // For example, find a main content area if available:
      // injectionParentElement = document.querySelector('#main-content') || document.querySelector('main') || document.body;
      return; // Exit if no suitable injection point is found
    }
    
    if (document.getElementById('resumeBuilderTailorBtn')) {
      console.log("Content Script (injectTailorButton): ResumeBuilder button already injected.");
      return; // Avoid injecting multiple times
    }

    const self = this; // Preserve 'this' context for the callback
    chrome.runtime.sendMessage({ action: "getAuthToken" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("JobScraper: Error checking auth status:", chrome.runtime.lastError.message);
        // Do not inject the button if there's an error checking status
        return;
      }
      
      const isLoggedIn = response && response.token;
      
      console.log("Content Script (injectTailorButton): Attempting to inject button into/after:", injectionParentElement);
      
      const tailorButton = document.createElement('button');
      tailorButton.id = 'resumeBuilderTailorBtn';
      
      // Basic styling - make this better with CSS or by matching site styles
      tailorButton.style.marginLeft = '10px';
      tailorButton.style.padding = '10px 15px'; // Slightly larger
      tailorButton.style.backgroundColor = '#ffd700'; // Yellow
      tailorButton.style.color = 'black';
      tailorButton.style.border = 'none';
      tailorButton.style.borderRadius = '1000px';
      tailorButton.style.cursor = 'pointer';
      tailorButton.style.fontSize = '16px'; // Try to match surrounding font size
      tailorButton.style.fontWeight = '600'; // semi-bold
      tailorButton.style.lineHeight = 'inherit';
      
      if (isLoggedIn) {
        tailorButton.innerHTML = '🍌 Resume Banana'; // Logged-in text
        tailorButton.addEventListener('click', self.handleTailorButtonClick.bind(self));
      } else {
        tailorButton.innerHTML = 'Login to Use Banana'; // Logged-out text
        tailorButton.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            action: "openLoginTab",
            url: "http://localhost:3000/login"
          });
        });
      }

      // Append the fully configured button to the DOM
      if (injectionParentElement) {
        injectionParentElement.appendChild(tailorButton);
        console.log("Content Script (injectTailorButton): Button injected successfully.");
      }
    });
  },

  /**
   * Main function to run on page load for the scraping feature.
   * It will try to inject the button if it determines it's a job posting page.
   * It also sets up a listener to react to auth changes in real-time.
   */
  initialize: function() {
    // Using a slight delay and also checking for document readiness.
    // Some job sites load content dynamically.
    const attemptInjection = () => {
      if (JobScrapingHelpers.isJobPostingPage()) {
        this.injectTailorButton();
      } else {
        // console.log("Content Script (initializeJobScrapingFeature): Not a recognized job posting page, or already tried.");
      }
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
      // If document is already loaded, attempt injection after a short delay
      setTimeout(attemptInjection, 1500); // Adjust delay as needed
    } else {
      // Otherwise, wait for the load event
      window.addEventListener('load', () => {
        setTimeout(attemptInjection, 1500); // Adjust delay as needed
      }, { once: true });
    }

    // --- Add listener for Authentication Changes ---
    // This allows the button to update in real-time if the user logs in/out in another tab.
    const self = this;
    chrome.storage.onChanged.addListener((changes, areaName) => {
      // We only care about changes to 'authToken' in local storage.
      if (areaName !== 'local' || !changes.authToken) {
        return;
      }

      const tailorButton = document.getElementById('resumeBuilderTailorBtn');
      if (!tailorButton) {
        // If the button doesn't exist on the page, don't do anything.
        // This can happen if the user navigates away or the page is not a job page.
        return;
      }

      console.log("Content Script (storage.onChanged): Auth token has changed. Updating button state.");
      
      const isLoggedIn = !!changes.authToken.newValue;

      // The most reliable way to change the event listener is to replace the node.
      // cloneNode(true) copies the node and all its attributes (like style and class) and children,
      // but it does NOT copy event listeners.
      const newButton = tailorButton.cloneNode(true);

      if (isLoggedIn) {
        newButton.innerHTML = '🍌 Resume Banana'; // Logged-in text
        newButton.addEventListener('click', self.handleTailorButtonClick.bind(self));
      } else {
        newButton.innerHTML = 'Login to Use Banana'; // Logged-out text
        newButton.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            action: "openLoginTab",
            url: "http://localhost:3000/login"
          });
        });
      }

      // Replace the old button with the newly configured one.
      if (tailorButton.parentNode) {
        tailorButton.parentNode.replaceChild(newButton, tailorButton);
      }
    });
  }
}; 