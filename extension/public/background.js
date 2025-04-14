// background.js - Handles core logic (Updated for Google Gemini API)

// --- Configuration ---
const GEMINI_MODEL = "gemini-2.0-flash"; // Or "gemini-pro", etc. check Gemini docs for available models
const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// --- Base Resume Placeholder ---
// Replace this with your actual base resume content
const BASE_RESUME = `YOUR NAME
City, State | your.email@example.com | (123) 456-7890 | github.com/yourusername | linkedin.com/in/yourprofile

PROFESSIONAL SUMMARY
Results-driven Frontend Engineer with 3+ years of non-internship experience specializing in building intuitive, high-performance web applications using React, Next.js, and TypeScript. Proven ability to enhance user experiences, optimize complex workflows, and ensure application stability and quality. Leverages a unique architectural background to inform user-centric design and technical solutions. Committed to operational excellence, collaborative problem-solving, and delivering measurable outcomes within fast-paced Agile environments.

PROFESSIONAL EXPERIENCE

Frontend Engineer
Conduent Inc. | January 2024 - Present

*   Transformed the E-ZPass account creation workflow within the Next.js application via intuitive React/MUI redesigns, slashing clicks (24->15), improving efficiency, and ensuring full keyboard accessibility.
*   Engineered critical modules within a complex Next.js distributed architecture, implementing resilient state synchronization and fault tolerance patterns for interacting with multiple backend microservices, ensuring data consistency.
*   Fortified stability by eliminating 100+ bugs, implementing 100% complex validation (Yup/RHF) including handling asynchronous backend checks/workflows, achieving ~70% test coverage, enhancing data integrity.
*   Accelerated frontend performance via deep-dive analysis (Chrome Profiler) and targeted Next.js/React rendering & data fetching optimizations, enhancing local Core Web Vitals (LCP/FID) by ~25%.
*   Accelerated critical error resolution for operational excellence by leveraging Sentry monitoring to rapidly diagnose bugs with detailed context, significantly aiding faster MTTR on critical user-facing issues.
*   Mastered TypeScript and GraphQL integration (mutations, fragments) within the Next.js architecture, applying strict typing and delivering dynamic Strapi CMS features with i18n support (EN/ES) ahead of schedule.
*   Accelerated feature delivery within Agile sprints by contributing key insights during ceremonies, adapting effectively to evolving requirements to improve team workflow and ensure predictable milestone completion.
*   Environment: JavaScript, TypeScript, HTML5, CSS3, React.js, Next.js, Material UI, Zustand, React Context API, Yup, GraphQL, RESTful APIs, Strapi CMS, Chrome DevTools, React DevTools, Sentry, Adobe XD, Git.

Software Developer
Cubastion Consulting | June 2019 - June 2021

*   Addressed cumbersome dealer quoting processes while adapting to frequent scope changes, orchestrating frontend development (React/Redux) for new B2B features, driving 12% increase in dealer promotion adoption.
*   Engineered frontend solutions within a complex microservices architecture, implementing robust patterns for asynchronous data synchronization and fault tolerance across distributed backend services, cutting integration failures by 25%.
*   Architected predictable state management for asynchronous, multi-stage ordering workflows using Redux Saga/Thunk, ensuring data integrity during long-running operations and cutting related transaction errors by 15%.
*   Solved poor performance rendering large parts catalogs 10k+ items implementing virtualization (react-window) and code-splitting optimizations, improving key page load metrics such as LCP by 20% for a seamless dealer experience.
*   Ensured reliable global access for dealerships by configuring and managing frontend deployments using AWS S3 and CloudFront CDN involving S3 configuration and caching strategies, optimizing delivery speed and availability across India/Japan.
*   Reduced cross-team integration friction by spearheading frontend collaboration on REST API design using OpenAPI specifications, decreasing integration bugs by 25% and enabling faster feature delivery.
*   Environment: React.js, JavaScript, Typescript, Node.js, Redux (Redux Saga/Thunk exposure), HTML5, CSS3, Tailwind CSS, REST APIs, OpenAPI, Jest/RTL, AWS S3, CloudFront, API Gateway, Lambdas, DynamoDB, Git, JIRA, Analytics Tools.

UI/UX Designer & Frontend Developer (Founding Team)
PrakritiFresh | January 2018 - May 2019

*   Championed user-centric design via direct field research, enabling 50+ low-tech rickshaw pullers through highly accessible interfaces featuring simplified layouts, offline-first considerations, and voice prompts.
*   Spearheaded the initial UI/UX design across 3 core platform components (consumer app, delivery interface, dashboard), creating intuitive flows and a consistent visual language using React Native/React.
*   Accelerated core feature delivery (browsing, cart, order) amidst rapidly shifting startup priorities by quickly mastering React Native and adapting implementation plans to evolving user feedback/business needs.
*   Collaborated cross-functionally to launch an internal analytics dashboard frontend (React), visualizing 10+ key operational metrics by consuming REST APIs deployed on AWS EC2 querying DynamoDB.
*   Environment: JavaScript, React Native, React, HTML5, CSS3, Git, Wireframing Tools, Qualitative User Research Methods, AWS (EC2, DynamoDB exposure).

EDUCATION

MASTER OF SCIENCE IN INFORMATION TECHNOLOGY
Arizona State University | Graduated: December 2023 | GPA: 3.6/4.0
Relevant Coursework: Advanced Web Development, Distributed Systems Architecture, Cloud Computing, Data Structures & Algorithms

BACHELOR OF ARCHITECTURE
Indian Institute of Technology, Kharagpur | Graduated: June 2019
Applied architectural skills in design thinking, spatial visualization, and user journey planning to enhance digital interface design and user experience.

PROJECTS

SERVERLESS E-COMMERCE PLATFORM (PERSONAL PROJECT)
Technologies: React.js, AWS Amplify, Lambda, DynamoDB, API Gateway, Cognito | March 2023 - Present
*   Designed and implemented a fully serverless e-commerce application using AWS services; created a scalable architecture handling dynamic catalog, auth, and order processing with sub-200ms response times.
*   Implemented responsive, accessible UI using React composition patterns and CSS Grid/Flexbox; achieved a 98% Lighthouse accessibility score and consistent cross-device performance.

ISBL - DISTRIBUTED FILE MANAGEMENT SYSTEM
Technologies: React.js, Next.js, AWS S3, DynamoDB, Elasticsearch | January 2021 - July 2021
*   Architected a microservice-based file management system for 10GB+ document data; implemented event-driven architecture (S3 triggers, Lambda), reducing file access time to under 3 minutes.
*   Developed a fault-tolerant frontend with graceful degradation and offline capabilities using Service Workers and IndexedDB, ensuring key functionality during network interruptions.

TECHNICAL SKILLS

Frontend: React.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Next.js, Redux, Context API, Zustand, Responsive Design, Cross-Browser Compatibility, RESTful APIs, GraphQL, Material UI, Tailwind CSS
AWS Services: S3, CloudFront, Lambda, DynamoDB, API Gateway, Cognito, Amplify, CloudWatch, EC2 (Exposure)
CS Fundamentals: Data Structures, Algorithms, Distributed Systems, API Design, Object-Oriented Design, Complexity Analysis
Performance & Optimization: Code Splitting, Lazy Loading, Virtualization, Image Optimization, Browser Caching, Profiling (DevTools, Lighthouse), Core Web Vitals
DevOps & Testing: CI/CD Awareness, Monitoring (Sentry), Alerting Concepts, Incident Response Concepts, Jest/RTL (Exposure), Git, JIRA`; // Complete resume content

// --- Listener for messages from Popup or Content Script ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerGeneration") {
    console.log("Background: Received triggerGeneration");
    sendMessageToPopup({
      action: "statusUpdate",
      message: "Getting selected text...",
    });

    // 1. Get active tab and execute content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const activeTabId = tabs[0].id;

        chrome.scripting
          .executeScript({
            target: { tabId: activeTabId },
            // Ensure content.js path is correct relative to manifest
            files: ["content.js"],
          })
          .then(() => {
            console.log(
              "Background: Injected/confirmed content script. Sending message to get selection."
            );
            chrome.tabs.sendMessage(
              activeTabId,
              { action: "getSelection" },
              (response) => {
                handleContentScriptResponse(response, sendResponse); // Pass sendResponse for async handling
              }
            );
          })
          .catch((err) => {
            handleScriptInjectionError(err, sendResponse);
          });
      } else {
        handleNoActiveTabError(sendResponse);
      }
    });

    // Indicate that the response will be sent asynchronously
    return true;
  }
});

// --- Helper: Handle response from content script ---
function handleContentScriptResponse(response, sendResponse) {
  if (chrome.runtime.lastError) {
    console.error(
      "Background: Error sending/receiving message to content script:",
      chrome.runtime.lastError.message
    );
    sendMessageToPopup({
      action: "error",
      message: "Could not communicate with the page. Try reloading.",
    });
    sendResponse({
      status: "error",
      message: chrome.runtime.lastError.message,
    });
    return;
  }

  if (response && response.status === "success" && response.text) {
    console.log("Background: Received selected text.");

    // Give feedback about detected text
    const textPreview =
      response.textPreview ||
      response.text.substring(0, 100) +
        (response.text.length > 100 ? "..." : "");
    sendMessageToPopup({
      action: "statusUpdate",
      message: "Text detected! Preview:",
      textPreview: textPreview,
    });

    setTimeout(() => {
      sendMessageToPopup({
        action: "statusUpdate",
        message: "Generating tailored JSON resume with Gemini...",
      });
      // Call the LLM (Gemini)
      callGeminiApi(response.text) // Pass the job description text
        .then((generatedJsonString) => {
          // Expecting a JSON string now
          console.log(
            "Background: Gemini API call successful, returning JSON string."
          );
          sendMessageToPopup({
            action: "generationComplete",
            // Send the raw JSON string, popup needs to parse it
            text: generatedJsonString,
          });
          sendResponse({ status: "success", text: generatedJsonString });
        })
        .catch((error) => {
          console.error("Background: Gemini API call failed:", error);
          // Create user-friendly error message
          let userFriendlyError = "Generation Error."; // Default
          if (error.message.includes("API key not valid")) {
            userFriendlyError = "Invalid or missing API Key.";
          } else if (error.message.includes("API request failed")) {
            userFriendlyError = "API Request Failed.";
          } else if (error.message.includes("valid JSON")) {
            userFriendlyError = "Failed to generate valid JSON.";
          } else if (error.message.includes("safety")) {
            userFriendlyError = "Content blocked (safety).";
          } else if (error.message.includes("quota")) {
            userFriendlyError = "API Quota Exceeded.";
          } else if (error.message.includes("empty response")) {
            userFriendlyError = "API returned empty response.";
          }

          sendMessageToPopup({
            action: "error",
            message: `Gemini Error: ${userFriendlyError} Details: ${error.message}`,
          });
          sendResponse({ status: "error", message: error.message });
        });
    }, 1000); // Keep delay for UI feedback
  } else {
    // This case might not be reached if content.js always sends success
    const errorMessage =
      response?.message ||
      (!response?.text
        ? "No text selected on the page."
        : "Failed to get selection from page.");
    console.log("Background: Failed to get selection -", errorMessage);
    sendMessageToPopup({ action: "error", message: errorMessage });
    sendResponse({ status: "error", message: errorMessage });
  }
}

// --- Helper: Handle script injection error ---
function handleScriptInjectionError(err, sendResponse) {
  console.error("Background: Failed to inject content script:", err);
  sendMessageToPopup({
    action: "error",
    message: "Failed to inject script. Reload page/browser.",
  });
  sendResponse({ status: "error", message: err.message });
}

// --- Helper: Handle no active tab error ---
function handleNoActiveTabError(sendResponse) {
  console.error("Background: Could not get active tab.");
  sendMessageToPopup({
    action: "error",
    message: "Could not identify active tab.",
  });
  sendResponse({ status: "error", message: "No active tab found" });
}

// --- Helper function to send messages to the popup ---
function sendMessageToPopup(message) {
  console.log("Background: Sending message to popup:", message.action);
  chrome.runtime.sendMessage(message).catch((error) => {
    // Ignore errors if the popup isn't open, but log other unexpected errors
    if (
      error.message !==
        "Could not establish connection. Receiving end does not exist." &&
      error.message !==
        "The message port closed before a response was received."
    ) {
      console.warn(
        "Background: Could not send message to popup:",
        error.message
      );
    }
  });
}

// --- Function to call the Google Gemini API ---
async function callGeminiApi(jobDescription) {
  // 1. Retrieve API Key from storage
  let apiKey;
  try {
    const data = await chrome.storage.local.get(["geminiApiKey"]);
    if (!data.geminiApiKey) {
      throw new Error(
        "Gemini API Key not found. Please set it via the extension's console."
      );
    }
    apiKey = data.geminiApiKey;
  } catch (error) {
    console.error("Background: Error retrieving API key:", error);
    throw new Error(error.message || "Could not retrieve API key.");
  }

  // 2. Construct the API URL
  const apiUrl = `${GEMINI_API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // --- Define the JSON Schema Example ---
  const jsonSchemaExample = `{
  "basics": {
    "name": "Your Full Name",
    "label": "Frontend Engineer",
    "email": "your.email@example.com",
    "phone": "+1-123-456-7890",
    "url": "https://yourportfolio.com",
    "location": {
      "city": "City",
      "region": "State",
      "country": "Country"
    },
    "profiles": [
      { "network": "LinkedIn", "username": "yourusername", "url": "https://linkedin.com/in/yourusername" },
      { "network": "GitHub", "username": "yourusername", "url": "https://github.com/yourusername" }
    ],
    "summary": "Tailored summary..."
  },
  "work": [
    {
      "name": "Company", "position": "Title", "startDate": "YYYY-MM", "endDate": "YYYY-MM",
      "story": "Optional tailored story...",
      "highlights": ["Tailored highlight 1", "Tailored highlight 2"]
    }
  ],
  "education": [
    {
      "institution": "University", "area": "Degree Area", "studyType": "Degree Type",
      "startDate": "YYYY-MM", "endDate": "YYYY-MM", "gpa": "X.X"
    }
  ],
  "skills": [
    { "name": "Category", "keywords": ["Skill1", "Skill2"] }
  ],
  "projects": [
    {
      "name": "Project", "description": "Tailored description...", "url": "https://...",
      "keywords": ["Tech1", "Tech2"]
    }
  ],
  "certificates": [
      { "name": "Cert Name", "date": "YYYY-MM", "issuer": "Issuer" }
  ],
  "languages": [
      { "language": "Lang", "fluency": "Level" }
  ]
}`; // Keep example concise

  // --- Construct the STRICTER Prompt ---
  const prompt = `IMPERATIVE: Your *only* task is to act as a JSON API endpoint. You MUST output a single, valid JSON object and NOTHING else. DO NOT use markdown. DO NOT add explanations. DO NOT add any text before the starting '{' or after the ending '}'.\n\nParse the provided BASE RESUME and JOB DESCRIPTION. Generate a JSON object conforming EXACTLY to the schema shown in the --- JSON SCHEMA EXAMPLE --- below.\n\nFollow these rules:\n1.  **Parse Base Resume:** Extract all information (contact, work, education, skills, projects, etc.) from the --- BASE RESUME ---.\n2.  **Target JSON Format:** Your entire output MUST be a JSON object matching the structure in --- JSON SCHEMA EXAMPLE ---.\n3.  **Populate Static Fields:** Fill the JSON using extracted data from the Base Resume, except for the fields listed in rule 4. Ensure reverse chronological order for work/education/certificates.\n4.  **Tailor Editable Fields:** Analyze the --- JOB DESCRIPTION ---. Modify *only* the following JSON fields to align with the job description's requirements and keywords:\n    *   \`basics.summary\` (2-3 tailored lines)\n    *   \`work[].story\` (Optional, tailored summary)\n    *   \`work[].highlights\` (3-6 tailored bullet points per role)\n    *   \`projects[].description\` (Tailored description)\n5.  **Work Highlights Content Rules:**\n    *   Use action verbs. Quantify results.\n    *   **Word Count Constraint (VERY IMPORTANT):** Keep bullets concise. Ideally 1 line (approx. 12-14 words), maximum 2 lines (approx. 26-29 words). DO NOT exceed 2 lines.\n    *   Relate directly to job description keywords/skills.\n    *   NO adverbs or fluff. NO first-person.\n6.  **Skills Content:** Extract/categorize hard skills. Add/emphasize skills from job description.\n7.  **FINAL OUTPUT RULE:** The response MUST start with '{' and end with '}'. No other text, formatting, or explanations are allowed.\n\n--- JSON SCHEMA EXAMPLE ---\n\`\`\`json\n${jsonSchemaExample}\n\`\`\`\n\n--- BASE RESUME ---\n${BASE_RESUME}\n\n--- JOB DESCRIPTION ---\n${jobDescription}\n\n--- TAILORED RESUME JSON OUTPUT ---`; // No extra text after this marker

  // 4. Construct the Request Body
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      // Consider slightly increasing tokens if JSON might be large, but unlikely the issue
      // maxOutputTokens: 4096,
    },
    // Safety settings (optional, but can sometimes interfere)
    // safetySettings: [
    //   { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
    //   { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
    //   { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    //   { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    // ],
  };

  console.log("Background: Calling Gemini API (Strict JSON Prompt)");
  // console.log("Background: Prompt Start:", prompt.substring(0, 300)); // Log for debug

  // 5. Make the Fetch Call
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // 6. Handle Non-OK Responses
    if (!response.ok) {
      let errorBodyText = await response.text();
      let errorDetails = `HTTP status ${response.status}`;
      try {
        const errorData = JSON.parse(errorBodyText);
        errorDetails += `: ${errorData.error?.message || "Unknown API error"}`;
        if (
          errorData.error?.message?.toLowerCase().includes("api key not valid")
        ) {
          throw new Error(
            "API request failed: API Key not valid. Please check."
          );
        }
        // Potentially check for other specific errors here (e.g., billing issues)
      } catch (e) {
        errorDetails += ` - Body: ${errorBodyText}`;
      }
      console.error(`Background: API request failed: ${errorDetails}`);
      throw new Error(`API request failed: ${errorDetails}`);
    }

    // 7. Parse Successful Response
    const data = await response.json();

    // Check for candidates
    const candidate = data?.candidates?.[0];
    if (!candidate) {
      console.error(
        "Background: No candidates in response:",
        JSON.stringify(data, null, 2)
      );
      if (data?.promptFeedback?.blockReason) {
        throw new Error(
          `API prompt blocked: ${data.promptFeedback.blockReason}`
        );
      }
      throw new Error("API returned no candidates. Check Gemini console.");
    }

    const finishReason = candidate.finishReason;
    if (
      finishReason &&
      finishReason !== "STOP" &&
      finishReason !== "MAX_TOKENS"
    ) {
      const safetyRatings = JSON.stringify(candidate.safetyRatings);
      console.warn(
        `Background: Generation stopped: ${finishReason}. Ratings: ${safetyRatings}`
      );
      let reasonMsg = `Generation stopped: ${finishReason}.`;
      if (finishReason === "SAFETY")
        reasonMsg = "Content blocked (safety). Check safety settings.";
      else if (finishReason === "RECITATION")
        reasonMsg = "Content blocked (recitation).";
      throw new Error(reasonMsg);
    }

    // Check content structure
    if (
      !candidate.content?.parts?.[0]?.text ||
      typeof candidate.content.parts[0].text !== "string"
    ) {
      console.error(
        "Background: Unexpected API response structure:",
        JSON.stringify(data, null, 2)
      );
      throw new Error("Could not parse text from API response structure.");
    }

    // Extract text (should be JSON string)
    const generatedText = candidate.content.parts[0].text.trim();

    // *** VALIDATE JSON OUTPUT ***
    let validatedJsonString;
    try {
      if (!generatedText) {
        throw new Error("API returned an empty response string.");
      }
      // Attempt to parse - if this works, it's valid JSON
      JSON.parse(generatedText);
      validatedJsonString = generatedText;
      console.log("Background: Received VALID JSON from Gemini.");
    } catch (parseError) {
      console.error(
        "Background: CRITICAL - Gemini output was NOT valid JSON:",
        parseError.message,
        "\n--- Raw Output Start ---\n",
        generatedText.substring(0, 500), // Log beginning of bad output
        "\n--- Raw Output End ---\n"
      );
      // Still throw an error, but maybe slightly different message
      throw new Error(
        `Generated response was not valid JSON (parsing failed). Raw output logged. Error: ${parseError.message}`
      );
    }

    console.log("Background: Sending validated JSON string to popup.");
    return validatedJsonString;
  } catch (error) {
    // Log the full error for debugging
    console.error(
      "Background: Error during callGeminiApi fetch/processing:",
      error
    );
    // Re-throw with a potentially cleaned message
    throw new Error(
      error.message || "Network error or processing failed during API call."
    );
  }
}

// Initial setup log
chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "Basic Resume Tailor (Gemini) Background Service Worker Installed/Updated."
  );
  // You could potentially set default storage values here if needed
});

console.log("Background Service Worker Started (Gemini Configured).");
