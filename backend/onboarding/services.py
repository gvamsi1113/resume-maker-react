# backend/onboarding/services.py
import os
import json
from google import genai
from google.genai import types

# --- AI Client Setup ---
GENAI_CONFIGURED = False
client = None
try:
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("API Key not found for GenAI Client.")
    client = genai.Client(api_key=api_key)
    GENAI_CONFIGURED = True
    print("GenAI Client configured successfully for onboarding service.")
except Exception as e:
    print(f"(Onboarding Service) ERROR configuring GenAI Client: {e}")
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
    "other_extracted_data": "string - A text field for any other relevant information or key-value pairs found that don't fit other structured fields. Be concise."
}"""

    prompt = f"""ABSOLUTELY CRITICAL: YOUR ONLY RESPONSE MUST BE A SINGLE, VALID JSON OBJECT. NO OTHER TEXT, MARKDOWN, EXPLANATIONS, OR ANY CHARACTERS BEFORE THE OPENING '{{' OR AFTER THE CLOSING '}}' ARE ALLOWED. DOUBLE CHECK YOUR FINAL OUTPUT.

**TASK:**
Analyze the content of the provided resume document (passed as the next part). 
1. Accurately extract contact details (first_name, last_name, email, phone, location) and social media profile links.
2. Transform and enhance the remaining information from the document to create a 'perfect' professional resume, covering summary, work experience, projects, skills, education, languages, and certificates.
3. Capture any other relevant information not fitting the defined sections into an 'other_extracted_data' field.
4. Populate a SINGLE JSON OBJECT with all this information, adhering to the structure defined below and following the STRICT GUIDELINES for content quality and style.

The output MUST be a SINGLE VALID JSON object with the following structure:
{json_structure}

**STRICT GUIDELINES FOR CONTENT QUALITY AND STYLE:**

1.  **Contact and Social Information:**
    *   Accurately extract `first_name`, `last_name`, primary `email`, primary `phone` number, and `location` (e.g., City, ST).
    *   Populate the `socials` array with any found social media links (e.g., LinkedIn, GitHub) or personal portfolio/website URLs. Include network name, username (if applicable), and full URL.
    *   For `other_extracted_data`, include any other distinct pieces of information from the resume that do not fit into the other structured fields. This could be brief notes, objectives if explicitly stated and very distinct, or other miscellaneous details. Keep it concise.

2.  **General Quality & Style (for resume sections like summary, work, etc.):**
    *   Maintain an impersonal, objective tone. STRICTLY NO first-person ("I", "me", "my", "we", "our").
    *   NO adverbs (e.g., successfully, effectively, efficiently, very) or vague filler words. Be direct and factual.
    *   NO POTENTIAL, NO AMBIGUITY, NO VAGUE STUFF. NO EXPLANATORY TEXT. NO BRACKETS like (exposure, expert, etc).
    *   Ensure all dates are in YYYY-MM-DD, YYYY-MM, or YYYY format. If day is not present, use YYYY-MM. If month is not present, use YYYY.
    *   The 'work' array should be ordered reverse chronologically (most recent first), if discernible from the input document.

3.  **Summary (`summary` field):**
    *   **Length:** Approximately 3 concise lines.
    *   **Content:** Rewrite the summary from the document to be a compelling pitch highlighting key achievements, skills, and career trajectory, suitable for a general professional profile. Output this as a single string value.

4.  **Work Experience (`work[].highlights` field):
    *   **Quantity:** Aim for 4-6 impactful bullet points per work entry.
    *   **Structure:** MUST follow Action Verb -> Specific Task/Accomplishment -> Quantifiable Result (Metric).
    *   **Action Verbs:** Every bullet point MUST begin with a strong action verb (e.g., Led, Developed, Implemented, Optimized, Reduced, Managed, Created, Automated, Spearheaded, Architected).
    *   **Quantify Everything:** MUST include specific, relevant, numerical metrics where appropriate and inferable. Use numbers (e.g., "Reduced API latency by 30%", "Managed budget of $500K", "Increased user engagement by 15%", "Processed 10K records daily"). Ensure metrics are practical and common for the achievement described. If specific numbers are not in the source, try to create realistic and impactful quantifications based on the context of the achievement.
    *   **Conciseness (VERY IMPORTANT):** Bullet points MUST be brief. Aim for approximately 185-210 characters including spaces. This is a strong guideline.
    *   **Content Focus:** Rewrite original highlights (or create new ones if the source is poor) to be achievement-focused, showcasing impact and results.

5.  **Projects (`projects` field):
    *   **Description (`projects[].description`):** Make the description impact-focused. Highlight the project's purpose, key achievements, and results. Clearly state the technologies and skills utilized.
    *   **Keywords (`projects[].keywords`):** List relevant keywords or technologies for the project.

6.  **Skills (`skills` field):
    *   **Content:** Extract and list hard skills (technical skills, tools, languages, frameworks, methodologies) from the document. Do not add skill level references unless explicitly and clearly stated in the source.
    *   **Categorization:** If skills are already categorized in the source, try to maintain a similar logical grouping (e.g., "Frontend", "Backend", "Databases", "Cloud", "Methodologies"). If not categorized, attempt to group them logically. Output as an array of objects, each with a 'category' (string) and 'skills' (an array of strings for that category).

7.  **Education (`education` field):
    *   **Content:** Ensure accuracy of institution, degree, field of study, and end date. 
    *   **Achievements (`education[].achievements`):** If academic achievements are mentioned (e.g., GPA, honors, relevant coursework, thesis), list them clearly.

8.  **Languages (`languages` field):
    *   **Content:** List languages and include proficiency levels if specified in the source document (e.g., "English (Native)", "Spanish (Conversational)").

9.  **Certificates (`certificates` field):
    *   **Content:** List certifications with name, issuing organization, and issue date. Add relevance if mentioned or clearly inferable.

**FINAL CHECK & OUTPUT CONSTRAINT (ABSOLUTELY CRITICAL):** Before completing your response, verify that the ENTIRE output is a SINGLE, perfectly valid JSON object starting *exactly* with '{{' and ending *exactly* with '}}'. No other text, markdown, or explanations are permitted. Ensure all strings are properly quoted and escaped, and all commas and brackets are correctly placed.

"""
    return prompt


def _call_gemini_api(
    prompt: str,
    resume_part: types.Part,
    model_name: str = "gemini-2.5-pro-preview-05-06",
) -> types.GenerateContentResponse | None:
    """Submits the prompt and resume data to the Gemini API and returns the response."""
    try:
        # Call the Gemini API to generate content based on the prompt and resume part.
        print(f"Calling Gemini model ({model_name}) to process file content...")
        response = client.models.generate_content(
            model=f"models/{model_name}",
            contents=[prompt, resume_part],
        )
        print("Gemini API response received.")
        return response
    except Exception as e:
        # Log any errors during the API call.
        print(f"ERROR during Gemini API call: {type(e).__name__} - {e}")
        return None


def _process_gemini_response(
    response: types.GenerateContentResponse | None,
) -> dict | None:
    """Parses the Gemini API's response, expecting a JSON string, into a Python dictionary."""
    if response is None:
        print("Cannot process None response from Gemini API.")
        return None

    # Step 1: Check for content blocking from the API.
    print("Processing AI response...")
    try:
        if (
            hasattr(response, "prompt_feedback")
            and response.prompt_feedback
            and response.prompt_feedback.block_reason
        ):
            block_reason_str = str(response.prompt_feedback.block_reason)
            print(f"Processing blocked by API. Reason: {block_reason_str}")
            return None
    except AttributeError:
        # This can happen if prompt_feedback itself is missing, which is unusual but handled.
        print("AttributeError checking prompt_feedback, proceeding...")
    except Exception as e:
        # Catch any other unexpected errors during feedback check.
        print(f"Unexpected error checking prompt_feedback: {type(e).__name__} - {e}")
        # Depending on policy, may return None or attempt to proceed if error is non-critical.

    # Step 2: Extract the text content from the response.
    generated_text = None
    try:
        if hasattr(response, "text") and response.text:
            generated_text = response.text
            print("Successfully extracted text using response.text.")
        else:
            # Log if the expected text attribute is missing or empty.
            print(
                f"Warning: response.text is missing or empty. Candidates: {getattr(response, 'candidates', 'N/A')}"
            )
            return None
    except ValueError as e:
        # Handle cases where accessing response.text might raise ValueError (e.g. if it contains non-text data unexpectedly).
        print(
            f"ValueError extracting response.text: {e}. Candidates: {getattr(response, 'candidates', 'N/A')}"
        )
        return None
    except Exception as e:
        # Catch any other unexpected errors during text extraction.
        print(f"Unexpected error extracting response text: {type(e).__name__} - {e}")
        return None

    if generated_text is None:
        # This check is redundant if prior returns are hit, but acts as a safeguard.
        print("Error: Failed to extract valid text from AI response after checks.")
        return None

    # Step 3: Clean the extracted text to prepare it for JSON parsing.
    # Remove common markdown code fences and leading/trailing whitespace.
    cleaned_json_string = (
        generated_text.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    if not cleaned_json_string:
        # Log if the string is empty after cleaning, meaning no parsable content.
        print("Error: Cleaned JSON string is empty after stripping prefixes/suffixes.")
        return None

    # Step 4: Parse the cleaned string into a Python dictionary.
    try:
        parsed_data = json.loads(cleaned_json_string)
        print("Successfully parsed JSON from AI response.")
        return parsed_data
    except json.JSONDecodeError as e:
        # Log detailed error if JSON parsing fails.
        print(f"ERROR parsing AI JSON output: {e}")
        print("\n--- String Attempted to Parse (first 1000 chars) ---\n")
        print(cleaned_json_string[:1000])  # Print a snippet for debugging.
        return None


def generate_structured_data_from_file_content(uploaded_file) -> dict | None:
    """
    Orchestrates the process of generating structured data from an uploaded file using AI.
    Reads file content, builds a prompt, calls the AI, and processes the response.
    """
    # Step 1: Validate AI client configuration and input file.
    if not GENAI_CONFIGURED or client is None:
        print("Error: AI Client not configured for processing. Cannot proceed.")
        return None
    if not uploaded_file:
        print("Error: No file provided for processing. Cannot proceed.")
        return None

    print(
        f"Processing file for AI structuring: {uploaded_file.name} ({uploaded_file.content_type})"
    )

    # Step 2: Read file content into bytes.
    try:
        file_content_bytes = uploaded_file.read()
        if not file_content_bytes:
            print("Error: Uploaded file content is empty.")
            return None
    except Exception as e:
        print(f"Error reading uploaded file content: {type(e).__name__} - {e}")
        return None

    # Step 3: Create a genai.types.Part object from the file bytes for multimodal input.
    try:
        resume_part = types.Part.from_bytes(
            data=file_content_bytes,
            mime_type=uploaded_file.content_type,
        )
        print("Created genai.types.Part from file bytes.")
    except Exception as e:
        print(f"Error creating genai.types.Part: {type(e).__name__} - {e}")
        return None

    # Step 4: Build the detailed prompt for the AI.
    prompt = _build_gemini_extraction_prompt()

    # Step 5: Call the Gemini API with the prompt and file data.
    api_response = _call_gemini_api(prompt=prompt, resume_part=resume_part)

    # Step 6: Process the API response to get structured data.
    structured_data = _process_gemini_response(api_response)

    if structured_data:
        print("Successfully generated structured data from file content.")
    else:
        print("Failed to generate structured data from file content.")

    return structured_data
