import React, { useState, useEffect } from "react";
import { generatePdf } from "./utils/pdfUtils"; // Import the PDF generator
// Import types from the new location
import {
  ResumeData,
  ResumeBasics,
  ResumeWorkItem,
  ResumeEducationItem,
  ResumeSkillItem,
  ResumeProjectItem,
  ResumeCertificateItem,
  ResumeLanguageItem,
} from "./types/resumeTypes"; // Adjusted path

// --- Custom Job Data Type ---
interface ScrapedJobData {
  title: string;
  company: string;
  description: string;
  url: string;
}

// --- Message Types ---
interface StatusUpdateMessage {
  action: "statusUpdate";
  message: string;
  textPreview?: string;
}

interface GenerationCompleteMessage {
  action: "generationComplete";
  text: string; // This will be a JSON string
}

interface ErrorMessage {
  action: "error";
  message: string;
}

type BackgroundMessage =
  | StatusUpdateMessage
  | GenerationCompleteMessage
  | ErrorMessage;

const Popup: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Idle. Select text on a page or use the scraper."
  );
  const [isError, setIsError] = useState(false);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  // --- State for Raw Text ---
  const [rawGeneratedText, setRawGeneratedText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  // --- Update Copy Button Initial Text ---
  const [copyButtonText, setCopyButtonText] = useState("Copy Raw Output"); // Updated button text
  // --- State for Scraped Job Data ---
  const [scrapedJobData, setScrapedJobData] = useState<ScrapedJobData | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState("");

  const handleGenerateClick = () => {
    setStatusMessage("Processing...");
    setIsError(false);
    setTextPreview(null);
    setResumeData(null);
    setRawGeneratedText("");
    setIsGenerating(true);
    setCopyButtonText("Copy Raw Output");

    const messagePayload: { action: string; text?: string } = {
      action: "triggerGeneration",
    };

    if (jobDescriptionText.trim()) {
      messagePayload.text = jobDescriptionText;
      console.log("Popup: Sending 'triggerGeneration' with custom text from text area.");
    } else {
      console.log("Popup: Sending 'triggerGeneration' to get selected text from page.");
    }

    chrome.runtime.sendMessage(messagePayload, (response) => {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message?.includes(
          "Receiving end does not exist"
        )
          ? "Error: Background service inactive. Try reloading the extension."
          : `Error: ${chrome.runtime.lastError.message || "Unknown communication error"
          }`;
        setStatusMessage(errorMsg);
        setIsError(true);
        setIsGenerating(false);
        setResumeData(null);
        setRawGeneratedText("");
      } else if (response && response.status === "error") {
        setStatusMessage(`Error: ${response.message}`);
        setIsError(true);
        setIsGenerating(false);
        setResumeData(null);
        setRawGeneratedText("");
      } else {
        console.log(
          "Popup: 'triggerGeneration' message sent, waiting for async updates..."
        );
      }
    });
  };

  const handleCopyClick = () => {
    if (!rawGeneratedText) {
      setStatusMessage("Error: No output text available to copy.");
      setIsError(true);
      return;
    }
    const textToCopy = rawGeneratedText;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setStatusMessage("Raw output copied to clipboard!");
        setIsError(false);
        setCopyButtonText("Copied!");
        setTimeout(() => setCopyButtonText("Copy Raw Output"), 2000);
      })
      .catch((err) => {
        console.error("Popup: Copy error:", err);
        setStatusMessage("Error: Could not copy raw output.");
        setIsError(true);
      });
  };

  const handleDownloadClick = () => {
    if (!resumeData && !rawGeneratedText) {
      // Neither parsed data nor raw text is available
      setStatusMessage("Error: No resume content generated yet.");
      return;
    }

    if (!resumeData) {
      // Only raw text is available, cannot generate PDF from it directly anymore
      // Option 1: Disable button (already handled by `resumeData &&` condition below)
      // Option 2: Show a specific message
      setStatusMessage("Error: Could not parse resume data to generate PDF.");
      console.warn("PDF generation skipped: Resume data parsing failed.");
      return; // Or potentially offer raw text download as fallback?
    }

    setStatusMessage("Generating PDF...");
    try {
      // Pass the resumeData object directly
      generatePdf(resumeData);
      setStatusMessage("PDF Downloaded.");
      console.log(
        "Popup: PDF generation initiated successfully with JSON data."
      );
    } catch (error) {
      console.error("Popup: Error during PDF Generation:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setStatusMessage(`Error generating PDF: ${errorMessage}`);
    }
  };

  useEffect(() => {
    // On load, always check if there's scraped data waiting to be displayed.
    // This is better than relying on a URL parameter.
    chrome.storage.local.get('scrapedJobDetails', (result) => {
      if (result.scrapedJobDetails) {
        const data = result.scrapedJobDetails;
        console.log("Popup: Loaded scraped job details from storage:", data);
        setScrapedJobData(data);
        setJobDescriptionText(data.description || "");
        setStatusMessage("Scraped job details loaded. Edit and click Generate.");
        // Clear the data from storage so it's not reused accidentally on the next popup open.
        chrome.storage.local.remove('scrapedJobDetails');
      } else {
        console.log("Popup: No pending scraped job data found in storage.");
      }
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Check auth token on initial load
    chrome.runtime.sendMessage({ action: "getAuthToken" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Popup Auth: Error getting token on load:", chrome.runtime.lastError.message);
        setIsLoggedIn(false);
      } else if (response && response.token) {
        setIsLoggedIn(true);
        console.log("Popup Auth: Token found on load, user is logged in.");
      } else {
        setIsLoggedIn(false);
        console.log("Popup Auth: No token found on load, user is logged out.");
      }
    });

    // Listen for changes in storage (e.g., login/logout in another tab)
    const storageChangeHandler = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.authToken) {
        const hasToken = !!changes.authToken.newValue;
        setIsLoggedIn(hasToken);
        console.log(`Popup Auth: Storage changed. User is now ${hasToken ? 'logged in' : 'logged out'}.`);
        if (hasToken) {
          setStatusMessage("Logged in successfully. Ready to generate.");
        } else {
          setStatusMessage("Logged out. Please log in to continue.");
          setIsError(true); // Visually indicate a requires-action state
        }
      }
    };

    chrome.storage.onChanged.addListener(storageChangeHandler);

    return () => {
      chrome.storage.onChanged.removeListener(storageChangeHandler);
    };
  }, []); // Runs once on component mount

  useEffect(() => {
    const messageListener = (message: BackgroundMessage) => {
      console.log("Popup: Received message:", message.action, message);

      switch (message.action) {
        case "statusUpdate":
          {
            setStatusMessage(message.message);
            setTextPreview(message.textPreview || null);
            setIsError(false);
          }
          break;
        case "generationComplete":
          {
            const receivedText = message.text || "";
            setRawGeneratedText(receivedText);
            setIsGenerating(false);

            try {
              const parsedData: ResumeData = JSON.parse(receivedText);
              setResumeData(parsedData);
              setStatusMessage(
                "Resume JSON generated and parsed successfully!"
              );
              setTextPreview(null);
              setIsError(false);
            } catch (error) {
              console.error("Popup: Failed to parse JSON response:", error);
              setStatusMessage(
                "Warning: Output received, but it's not valid JSON."
              );
              setResumeData(null);
              setRawGeneratedText(receivedText);
              setIsError(true);
            }
          }
          break;
        case "error":
          {
            setStatusMessage(`Error: ${message.message}`);
            setResumeData(null);
            setRawGeneratedText("");
            setTextPreview(null);
            setIsGenerating(false);
            setIsError(true);
          }
          break;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const renderBasics = (basics: ResumeBasics) => (
    <div className="resume-section">
      <h4>
        {basics.name} <span className="label">({basics.label})</span>
      </h4>
      <p>
        {basics.email} | {basics.phone}
      </p>
      <p>
        {basics.location.city}, {basics.location.region}
      </p>
      {basics.url && (
        <p>
          <a href={basics.url} target="_blank" rel="noopener noreferrer">
            Portfolio
          </a>
        </p>
      )}
      {basics.profiles.map((p) => (
        <p key={p.network}>
          <a href={p.url} target="_blank" rel="noopener noreferrer">
            {p.network}
          </a>
        </p>
      ))}
    </div>
  );

  const renderSummary = (summary: string) => (
    <div className="resume-section">
      <h3>SUMMARY</h3>
      <p>{summary}</p>
    </div>
  );

  const renderWork = (work: ResumeWorkItem[]) => (
    <div className="resume-section">
      <h4>Experience</h4>
      {work.map((w, index) => (
        <div key={index} className="item">
          <h5>
            {w.position} <span className="subtle">at {w.name}</span>
          </h5>
          <p className="dates">
            {w.startDate} - {w.endDate}
          </p>
          {w.url && (
            <p>
              <a href={w.url} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            </p>
          )}
          {w.story && <p className="story">{w.story}</p>}
          <ul>
            {w.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderEducation = (education: ResumeEducationItem[]) => (
    <div className="resume-section">
      <h4>Education</h4>
      {education.map((e, index) => (
        <div key={index} className="item">
          <h5>
            {e.studyType} in {e.area}
          </h5>
          <p>{e.institution}</p>
          <p className="dates">
            {e.startDate} - {e.endDate} {e.gpa ? `(GPA: ${e.gpa})` : ""}
          </p>
        </div>
      ))}
    </div>
  );

  const renderSkills = (skills: ResumeSkillItem[]) => (
    <div className="resume-section">
      <h4>Skills</h4>
      <ul>
        {skills.map((s, index) => (
          <li key={index}>
            <strong>{s.name}:</strong> {s.keywords.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderProjects = (projects: ResumeProjectItem[]) => (
    <div className="resume-section">
      <h4>Projects</h4>
      {projects.map((p, index) => (
        <div key={index} className="item">
          <h5>{p.name}</h5>
          {p.url && (
            <p>
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                Link
              </a>
            </p>
          )}
          <p>{p.description}</p>
          <p>
            <em>Keywords: {p.keywords.join(", ")}</em>
          </p>
        </div>
      ))}
    </div>
  );

  const renderCertificates = (certificates?: ResumeCertificateItem[]) =>
    certificates &&
    certificates.length > 0 && (
      <div className="resume-section">
        <h4>Certificates</h4>
        <ul>
          {certificates.map((c, index) => (
            <li key={index}>
              {c.name} ({c.issuer}) - {c.date}
            </li>
          ))}
        </ul>
      </div>
    );

  const renderLanguages = (languages?: ResumeLanguageItem[]) =>
    languages &&
    languages.length > 0 && (
      <div className="resume-section">
        <h4>Languages</h4>
        <ul>
          {languages.map((l, index) => (
            <li key={index}>
              {l.language} ({l.fluency})
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Resume Tailor ✨</h1>
        <p className="status-message">
          <span className={isError ? "error-text" : "status-text"}>
            {statusMessage}
          </span>
        </p>
      </header>

      {scrapedJobData && (
        <div className="scraped-data-section">
          <h4>Scraped Job Details</h4>
          <div className="job-details">
            <p><strong>Title:</strong> {scrapedJobData.title}</p>
            <p><strong>Company:</strong> {scrapedJobData.company}</p>
            {scrapedJobData.url && (
              <p><strong>URL:</strong> <a href={scrapedJobData.url} target="_blank" rel="noopener noreferrer">View Job Posting</a></p>
            )}
          </div>
          <textarea
            className="job-description-textarea"
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            placeholder="Job description..."
            rows={10}
          />
        </div>
      )}

      <div className="actions">
        {isLoggedIn ? (
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        ) : (
          <button
            onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/login' })}
          >
            Login to Banana Resume
          </button>
        )}

        {/* Raw Text Preview Section */}
        {textPreview && (
          <div className="preview">
            <h4>Raw Output Preview:</h4>
            <pre>{textPreview}</pre>
          </div>
        )}

        {/* Render the structured resume data if available and valid */}
        <div className="result-container">
          {resumeData ? (
            <>
              {renderBasics(resumeData.basics)}
              {renderSummary(resumeData.summary)}
              {renderWork(resumeData.work)}
              {renderEducation(resumeData.education)}
              {renderSkills(resumeData.skills)}
              {renderProjects(resumeData.projects)}
              {renderCertificates(resumeData.certificates)}
              {renderLanguages(resumeData.languages)}
            </>
          ) : (
            /* Show placeholder or raw text if parsing failed */
            !isGenerating &&
            (rawGeneratedText ? (
              <div>
                <p className="placeholder">
                  Couldn't parse JSON. Displaying raw output:
                </p>
                <pre className="raw-output">{rawGeneratedText}</pre>
              </div>
            ) : (
              <p className="placeholder">
                [Generated resume data will appear here]
              </p>
            ))
          )}
        </div>

        {/* Show buttons only when raw output text is available */}
        {rawGeneratedText && !isGenerating && (
          <div className="button-container">
            <button className="action" onClick={handleCopyClick}>
              {copyButtonText} {/* Shows "Copy Raw Output" */}
            </button>
            {/* Only show Download PDF if parsing was successful (resumeData exists) */}
            {resumeData && (
              <button className="action" onClick={handleDownloadClick}>
                Download PDF from JSON
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
