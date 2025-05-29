# backend/onboarding/services.py
import os
import json
import logging
import tempfile  # Added for temporary file handling
from typing import Union  # For type hinting

from google import genai
from google.genai import types
import textract  # Import textract directly
from django.core.files.uploadedfile import UploadedFile  # For type checking

logger = logging.getLogger(__name__)

# --- AI Client Setup ---
GENAI_CONFIGURED = False
client = None
try:
    # Ensure API key is correctly fetched from environment variables
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "API Key (GOOGLE_API_KEY or GEMINI_API_KEY) not found in environment variables for GenAI Client."
        )
    client = genai.Client(api_key=api_key)
    GENAI_CONFIGURED = True
    logger.info(
        "GenAI Client configured successfully for onboarding service."
    )  # Use logger
except Exception as e:
    logger.error(
        f"(Onboarding Service) ERROR configuring GenAI Client: {e}"
    )  # Use logger
# --- End AI Client Setup ---


def _build_gemini_extraction_prompt() -> str:
    """Constructs and returns the detailed prompt for Gemini, defining the desired JSON structure and processing rules."""
    json_structure = """{
    "first_name": "string - Extracted first name",
    "last_name": "string - Extracted last name",
    "email": "string - Extracted primary email address",
    "phone": "string - Extracted primary phone number",
    "location": "string - Extracted primary location (e.g., City, State)",
    "socials": [{
        "network": "string - e.g., LinkedIn, GitHub, Portfolio",
        "username": "string - Profile username (if applicable)",
        "url": "string - Full URL to the profile/site"
    }],
    "summary": "string - A compelling, professional summary highlighting key achievements and career trajectory (approx 3 concise lines)",
    "work": [{
        "name": "string - Company Name",
        "position": "string - Role/Position",
        "url": "string - Company/Work URL",
        "startDate": "string - YYYY-MM or YYYY",
        "endDate": "string - YYYY-MM, YYYY, or Present",
        "story": "string - Brief narrative or context if applicable",
        "highlights": ["string - Achievement-focused bullet point, 185-210 chars each"]
    }],
    "projects": [{
        "name": "string - Project Name",
        "description": "string - Impact-focused project description including tech stack and skills used",
        "url": "string - Project URL",
        "keywords": ["string - Relevant keywords/technologies for the project"]
    }],
    "skills": [{
        "category": "string - Skill Category (e.g., Frontend, Backend)",
        "skills": ["string - List of skills in this category, possibly with proficiency"]
    }],
    "education": [{
        "institution": "string - Name of the institution",
        "area": "string - Field of study or major",
        "studyType": "string - Degree or type of study",
        "startDate": "string - YYYY-MM or YYYY",
        "endDate": "string - YYYY-MM or YYYY",
        "gpa": "string - Grade Point Average",
        "achievements": ["string - Notable academic achievements or relevant coursework"]
    }],
    "languages": ["string - Language with proficiency level (e.g., English (Native))"],
    "certificates": [{
        "name": "string - Name of the certificate",
        "issuing_organization": "string - Issuing body",
        "issue_date": "string - YYYY-MM-DD or YYYY-MM",
        "relevance": "string - Relevance of the certificate"
    }],
    "other_extracted_data": ["list of objects - Each item should be a simple JSON object of an unrecognized section like Position of Responsibility, etc."],
    "analysis": "string - A brief (2-3 sentences) textual analysis of the original resume, highlighting its key strengths, potential weaknesses or gaps, and actionable areas for improvement. Focus on content, structure, and impact relative to common best practices for resume writing."
}"""

    prompt = f"""ABSOLUTELY CRITICAL: YOUR ONLY RESPONSE MUST BE A SINGLE, VALID JSON OBJECT. NO OTHER TEXT, MARKDOWN, EXPLANATIONS, OR ANY CHARACTERS BEFORE THE OPENING '{{' OR AFTER THE CLOSING '}}' ARE ALLOWED. DOUBLE CHECK YOUR FINAL OUTPUT.

**TASK:**
Analyze the content of the provided resume document (passed as the next part). 
1. Accurately extract contact details (first_name, last_name, email, phone, location) and social media profile links.
2. Transform and enhance the remaining information from the document to create a 'perfect' professional resume, covering summary, work experience, projects, skills, education, languages, and certificates, adhering to the STRICT GUIDELINES below.
3. Capture any other relevant information not fitting the defined sections into the 'other_extracted_data' field. This field should be a JSON structure just like the rest of the fields/sections.
4. Generate a brief textual 'analysis' of the original resume, focusing on its strengths, weaknesses, and areas for improvement (2-3 sentences).
5. Populate a SINGLE JSON OBJECT with all this information, adhering to the structure defined below and following the STRICT GUIDELINES for content quality and style.

The output MUST be a SINGLE VALID JSON object with the following structure:
{json_structure}

**STRICT GUIDELINES FOR CONTENT QUALITY AND STYLE:**

1.  **Contact and Social Information:**
    *   Accurately extract `first_name`, `last_name`, primary `email`, primary `phone` number, and `location` (e.g., City, ST).
    *   Populate the `socials` array with any found social media links (e.g., LinkedIn, GitHub) or personal portfolio/website URLs. Include network name, username (if applicable), and full URL.

2.  **Other Extracted Data (`other_extracted_data` field):**
    *   Populate this as a LIST of sections. Extract any sections from the resume that does not fit into other structured JSON objects.

3.  **Resume Analysis (`analysis` field):**
    *   Provide a brief (2-3 sentences) textual analysis of the original resume.
    *   Focus on its overall strengths (e.g., clear structure, strong action verbs, good quantification).
    *   Identify potential weaknesses or gaps (e.g., missing contact info, vague descriptions, lack of metrics, typos).
    *   Suggest actionable areas for improvement (e.g., "Consider adding a portfolio link," "Quantify achievements in work experience section").
    *   The tone should be constructive and professional.

4.  **General Quality & Style (for resume sections like summary, work, etc.):**
    *   Maintain an impersonal, objective tone. STRICTLY NO first-person ("I", "me", "my", "we", "our").
    *   NO adverbs (e.g., successfully, effectively, efficiently, very) or vague filler words. Be direct and factual.
    *   NO POTENTIAL, NO AMBIGUITY, NO VAGUE STUFF. NO EXPLANATORY TEXT. NO BRACKETS like (exposure, expert, etc).
    *   Ensure all dates are in YYYY-MM-DD, YYYY-MM, or YYYY format. If day is not present, use YYYY-MM. If month is not present, use YYYY.
    *   The 'work' array should be ordered reverse chronologically (most recent first), if discernible from the input document.

5.  **Summary (`summary` field):**
    *   **Length:** Approximately 3 concise lines.
    *   **Content:** Rewrite the summary from the document to be a compelling pitch highlighting key achievements, skills, and career trajectory, suitable for a general professional profile. Output this as a single string value.

6.  **Work Experience (`work[].highlights` field):
    *   **Quantity:** Aim for 4-6 impactful bullet points per work entry.
    *   **Structure:** MUST follow Action Verb -> Specific Task/Accomplishment -> Quantifiable Result (Metric).
    *   **Action Verbs:** Every bullet point MUST begin with a strong action verb (e.g., Led, Developed, Implemented, Optimized, Reduced, Managed, Created, Automated, Spearheaded, Architected).
    *   **Quantify Everything:** MUST include specific, relevant, numerical metrics where appropriate and inferable. Use numbers (e.g., "Reduced API latency by 30%", "Managed budget of $500K", "Increased user engagement by 15%", "Processed 10K records daily"). Ensure metrics are practical and common for the achievement described. If specific numbers are not in the source, try to create realistic and impactful quantifications based on the context of the achievement.
    *   **Conciseness (VERY IMPORTANT):** Bullet points MUST be brief. Aim for approximately 185-210 characters including spaces. This is a strong guideline.
    *   **Content Focus:** Rewrite original highlights (or create new ones if the source is poor) to be achievement-focused, showcasing impact and results.

7.  **Projects (`projects` field):
    *   **Description (`projects[].description`):** Make the description impact-focused. Highlight the project's purpose, key achievements, and results. Clearly state the technologies and skills utilized.
    *   **Keywords (`projects[].keywords`):** List relevant keywords or technologies for the project.

8.  **Skills (`skills` field):
    *   **Content:** Extract and list hard skills (technical skills, tools, languages, frameworks, methodologies) from the document. Do not add skill level references unless explicitly and clearly stated in the source.
    *   **Categorization:** If skills are already categorized in the source, try to maintain a similar logical grouping (e.g., "Frontend", "Backend", "Databases", "Cloud", "Methodologies"). If not categorized, attempt to group them logically. Output as an array of objects, each with a 'category' (string) and 'skills' (an array of strings for that category).

9.  **Education (`education` field):
    *   **Content:** Ensure accuracy of institution, degree, field of study, and end date. 
    *   **Achievements (`education[].achievements`):** If academic achievements are mentioned (e.g., GPA, honors, relevant coursework, thesis), list them clearly.

10. **Languages (`languages` field):
    *   **Content:** List languages and include proficiency levels if specified in the source document (e.g., "English (Native)", "Spanish (Conversational)").

11. **Certificates (`certificates` field):
    *   **Content:** List certifications with name, issuing organization, and issue date. Add relevance if mentioned or clearly inferable.

**FINAL CHECK & OUTPUT CONSTRAINT (ABSOLUTELY CRITICAL):** Before completing your response, verify that the ENTIRE output is a SINGLE, perfectly valid JSON object starting *exactly* with '{{' and ending *exactly* with '}}'. No other text, markdown, or explanations are permitted. Ensure all strings are properly quoted and escaped, and all commas and brackets are correctly placed.

"""
    return prompt


def _build_contact_extraction_prompt(text_snippet: str) -> str:
    """Constructs a prompt for Gemini to extract contact details from a text snippet."""

    prompt = f"""Extract a single, valid JSON object with all the keys - first_name, last_name, email, phone. If a value for a key is not found in the text, use an empty string "" for that key. RETURN ONLY THE JSON OBJECT, NO OTHER TEXT, MARKDOWN, EXPLANATIONS, OR ANY CHARACTERS BEFORE THE OPENING '{{' OR AFTER THE CLOSING '}}' ARE ALLOWED. DOUBLE CHECK YOUR FINAL OUTPUT.

Input text:
---
{text_snippet}
---
"""
    return prompt


def _call_gemini_api(
    prompt: str,
    resume_part: types.Part,
    model_name: str = "gemini-2.5-pro-preview-05-06",  # Corrected model name, ensure it is valid
) -> types.GenerateContentResponse | None:
    """Submits the prompt and resume data to the Gemini API and returns the response."""
    try:
        logger.info(
            f"Calling Gemini model ({model_name}) to process file content..."
        )  # Use logger
        response = client.models.generate_content(  # Corrected: client.generate_content for some SDK versions or client.models.generate_content
            model=f"models/{model_name}",  # Ensure 'models/' prefix is correct for your SDK version
            contents=[prompt, resume_part],
        )
        logger.info("Gemini API response received.")  # Use logger
        return response
    except Exception as e:
        logger.error(
            f"ERROR during Gemini API call: {type(e).__name__} - {e}"
        )  # Use logger
        return None


def _process_gemini_response(
    response: types.GenerateContentResponse | None,
) -> dict | None:
    """Parses the Gemini API's response, expecting a JSON string, into a Python dictionary."""
    if response is None:
        logger.error("Cannot process None response from Gemini API.")  # Use logger
        return None

    logger.info("Processing AI response...")  # Use logger
    try:
        if (
            hasattr(response, "prompt_feedback")
            and response.prompt_feedback
            and response.prompt_feedback.block_reason
        ):
            block_reason_str = str(response.prompt_feedback.block_reason)
            logger.warning(
                f"Processing blocked by API. Reason: {block_reason_str}"
            )  # Use logger
            return None
    except AttributeError:
        logger.warning(
            "AttributeError checking prompt_feedback, proceeding..."
        )  # Use logger
    except Exception as e:
        logger.error(
            f"Unexpected error checking prompt_feedback: {type(e).__name__} - {e}"
        )  # Use logger

    generated_text = None
    try:
        if hasattr(response, "text") and response.text:
            generated_text = response.text
            logger.info(
                "Successfully extracted text using response.text."
            )  # Use logger
        else:
            logger.warning(
                f"Warning: response.text is missing or empty. Candidates: {getattr(response, 'candidates', 'N/A')}"  # Use logger
            )
            return None
    except ValueError as e:
        logger.warning(
            f"ValueError extracting response.text: {e}. Candidates: {getattr(response, 'candidates', 'N/A')}"  # Use logger
        )
        return None
    except Exception as e:
        logger.error(
            f"Unexpected error extracting response text: {type(e).__name__} - {e}"
        )  # Use logger
        return None

    if generated_text is None:
        logger.error(
            "Error: Failed to extract valid text from AI response after checks."
        )  # Use logger
        return None

    cleaned_json_string = (
        generated_text.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    if not cleaned_json_string:
        logger.error(
            "Error: Cleaned JSON string is empty after stripping prefixes/suffixes."
        )  # Use logger
        return None

    try:
        parsed_data = json.loads(cleaned_json_string)
        logger.info("Successfully parsed JSON from AI response.")  # Use logger
        return parsed_data
    except json.JSONDecodeError as e:
        logger.error(f"ERROR parsing AI JSON output: {e}")  # Use logger
        logger.error(
            f"Problematic string (first 500 chars): {cleaned_json_string[:500]}"
        )  # More context
        return None
    except Exception as e:
        logger.error(
            f"Unexpected error parsing JSON: {type(e).__name__} - {e}"
        )  # Use logger
        return None


def generate_structured_data_from_file_content(
    content_input: Union[UploadedFile, str],
) -> dict | None:
    """
    Orchestrates the process of generating structured data using AI, accepting either an uploaded file or extracted text.
    """
    if not GENAI_CONFIGURED or client is None:
        logger.error("Error: AI Client not configured for processing. Cannot proceed.")
        return None
    if not content_input:
        logger.error(
            "Error: No content (file or text) provided for AI processing. Cannot proceed."
        )
        return None

    resume_part = None
    try:
        if isinstance(content_input, str):
            logger.info(
                f"Main AI processing received extracted text ({len(content_input)} chars)."
            )
            if not content_input.strip():
                logger.warning(
                    "Provided text content for main AI is empty or whitespace."
                )
                return None
            resume_part = types.Part(text=content_input)
            logger.info("Created genai.types.Part from extracted text for main AI.")
        elif isinstance(content_input, UploadedFile):
            logger.info(
                f"Main AI processing received file: {content_input.name} ({getattr(content_input, 'content_type', 'N/A')})"
            )
            content_input.seek(0)  # Ensure file pointer is at the beginning
            file_content_bytes = content_input.read()
            content_input.seek(0)  # Reset pointer if it might be read again elsewhere
            if not file_content_bytes:
                logger.warning("Uploaded file content for main AI is empty.")
                return None

            mime_type = getattr(
                content_input, "content_type", "application/octet-stream"
            )
            if not mime_type:  # Fallback if content_type is empty or None
                mime_type = "application/octet-stream"

            resume_part = types.Part.from_bytes(
                data=file_content_bytes,
                mime_type=mime_type,
            )
            logger.info("Created genai.types.Part from file bytes for main AI.")
        else:
            logger.error(
                f"Invalid input type for main AI processing: {type(content_input)}. Expected UploadedFile or str."
            )
            return None
    except Exception as e:
        logger.error(
            f"Error preparing content for main AI (creating Part): {type(e).__name__} - {e}"
        )
        return None

    if not resume_part:
        logger.error("Resume part for AI processing could not be created.")
        return None

    prompt = _build_gemini_extraction_prompt()
    api_response = _call_gemini_api(prompt=prompt, resume_part=resume_part)
    structured_data = _process_gemini_response(api_response)

    if structured_data:
        logger.info("Successfully generated structured data from main AI processing.")
    else:
        logger.error("Failed to generate structured data from main AI processing.")
    return structured_data


def extract_text_from_uploaded_file(uploaded_file: UploadedFile) -> str | None:
    """
    Extracts text content from an uploaded file (Django UploadedFile object).
    Supports .txt, .pdf, .doc, .docx using textract.
    Returns the extracted text as a string, or None if extraction fails.
    """
    filename = uploaded_file.name
    logger.info(f"Attempting to extract text from file: {filename}")

    try:
        # Ensure stream is at the beginning for all reads
        uploaded_file.seek(0)

        if filename.lower().endswith(".txt"):
            logger.debug(f"Processing {filename} as a .txt file.")
            try:
                return uploaded_file.read().decode("utf-8")
            except UnicodeDecodeError:
                logger.warning(f"UnicodeDecodeError for {filename}, trying latin-1.")
                uploaded_file.seek(0)  # Reset stream before re-reading
                return uploaded_file.read().decode("latin-1")
            except Exception as e_txt:  # More specific exception variable
                logger.error(f"Error reading .txt file {filename}: {e_txt}")
                return None

        logger.debug(f"Processing {filename} with textract.")
        # For textract, write to a temporary file as it typically expects a file path
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=os.path.splitext(filename)[1]
        ) as tmp_file:
            uploaded_file.seek(0)  # Ensure reading from start for temp file
            for chunk in uploaded_file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name

        try:
            byte_content = textract.process(tmp_file_path)
            text_content = byte_content.decode("utf-8", errors="replace")
            logger.info(f"Successfully extracted text from {filename} using textract.")
            return text_content
        finally:
            os.remove(tmp_file_path)  # Ensure temporary file is always cleaned up

    except textract.exceptions.ExtensionNotSupported:
        logger.warning(
            f"textract does not support extension for file: {filename}. No fallback attempted."
        )
        return None
    except textract.exceptions.ShellError as se:
        logger.error(
            f"textract shell error for {filename}. Command: '{se.command}', Exit Code: {se.exit_code}, Stdout: '{se.stdout}', Stderr: '{se.stderr}'"
        )
        logger.error(
            "This often means a required system utility (e.g., pdftotext, antiword) is not installed or not in PATH."
        )
        return None
    except (
        Exception
    ) as e:  # General catch-all for other issues (e.g., tempfile errors, unexpected textract issues)
        logger.error(
            f"Error during text extraction for {filename}: {type(e).__name__} - {e}"
        )
        return None


def extract_contact_details_from_text_snippet(
    text_snippet_100_chars: str,
) -> dict | None:
    """
    Extracts contact details (first_name, last_name, email, phone) from a short text snippet
    using the Gemini API.
    """
    if not GENAI_CONFIGURED or client is None:
        logger.error("AI Client not configured. Cannot extract contact details.")
        return None

    if not text_snippet_100_chars or not text_snippet_100_chars.strip():
        logger.warning("Text snippet for contact extraction is empty or whitespace.")
        return None  # Or return dict with empty strings if that's preferred for empty input

    logger.info(
        f"Attempting to extract contact details from snippet: '{text_snippet_100_chars[:20]}...'"
    )

    prompt = _build_contact_extraction_prompt(text_snippet_100_chars)

    try:
        # Create a genai.types.Part object from the text snippet.
        text_part = types.Part(text=text_snippet_100_chars)
    except Exception as e:
        logger.error(
            f"Error creating types.Part from text snippet: {type(e).__name__} - {e}"
        )
        return None

    # Call the Gemini API - using a potentially different model or same one
    # For consistency, we use the same _call_gemini_api, which has a default model.
    # You might want to specify a different, possibly faster/cheaper model for this specific task.
    api_response = _call_gemini_api(prompt=prompt, resume_part=text_part)

    contact_details = _process_gemini_response(api_response)

    if contact_details:
        # Basic validation for expected keys, even if values are empty strings
        expected_keys = ["first_name", "last_name", "email", "phone"]
        if all(key in contact_details for key in expected_keys):
            logger.info(f"Successfully extracted contact details: {contact_details}")
            return contact_details
        else:
            logger.error(
                f"Extracted contact details JSON is missing one or more expected keys. Data: {contact_details}"
            )
            # You might want to return a dict with empty strings for missing keys here to guarantee structure
            # For now, returning None as the structure is not as expected.
            # Example of ensuring structure:
            # validated_details = {key: contact_details.get(key, "") for key in expected_keys}
            # logger.info(f"Partially extracted/validated contact details: {validated_details}")
            # return validated_details
            return None
    else:
        logger.error("Failed to extract or parse contact details from the snippet.")
        return None
