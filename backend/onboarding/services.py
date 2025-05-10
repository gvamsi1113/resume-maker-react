# backend/onboarding/services.py
import os
import json
import re
import time  # Import time for polling
from google import genai

from google.genai import types  # If using specific types later
from django.conf import settings  # Maybe needed for timeouts etc.

# --- AI Client Setup ---
GENAI_CONFIGURED = False
client = None
try:
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("API Key not found")
    client = genai.Client(api_key=api_key)
    # Optional verification (adjust model name if needed)
    # print("Verifying GenAI config for onboarding...")
    # _ = next(client.models.list(config={'page_size': 1}))
    # print("Onboarding GenAI Client configured.")
    GENAI_CONFIGURED = True
except Exception as e:
    print(f"(Onboarding) ERROR configuring GenAI Client: {e}")
# --- End AI Client Setup ---


# REMOVED extract_text_from_file function


def parse_and_structure_resume_file(uploaded_file) -> dict | None:
    """
    Uses AI (Gemini multimodal) to directly parse the uploaded file content
    into structured JSON, without using the File API first.
    Returns a dictionary on success, None on failure.
    """
    if not GENAI_CONFIGURED or client is None:
        print("Error: AI Client not configured for parsing.")
        return None
    if not uploaded_file:
        print("Error: No file provided for parsing.")
        return None

    print(
        f"Processing file content in memory: {uploaded_file.name} ({uploaded_file.content_type})"
    )
    try:
        # --- Step 1: Read file content as bytes ---
        file_content_bytes = uploaded_file.read()
        if not file_content_bytes:
            print("Error: Uploaded file content is empty.")
            return None

        # --- Step 2: Create a genai.types.Part object ---
        # Use from_bytes for raw content
        resume_part = types.Part.from_bytes(
            data=file_content_bytes,
            mime_type=uploaded_file.content_type,  # Provide the correct MIME type
        )
        print("Created genai.types.Part from file bytes.")

        # --- Step 3: Build the PARSING Prompt (Simpler - AI sees the file directly) ---
        json_structure = """{
    "raw_data": {
        "summary": "string",
        "work": [{"company": "string", "role": "string", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "highlights": ["string"]}],
        "projects": [{"name": "string", "description": "string", "highlights": ["string"]}],
        "skills": [{"category": "string", "skills": "string"}],
        "education": [{"institution": "string", "degree": "string", "field_of_study": "string", "end_date": "YYYY-MM-DD"}],
        "languages": ["string"],
        "certificates": [{"name": "string", "issuing_organization": "string", "issue_date": "YYYY-MM-DD"}]
    },
    "personalized": {
        "summary": "A compelling, personalized professional summary highlighting key achievements and career trajectory",
        "work": [{"company": "string", "role": "string", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "highlights": ["Achievement-focused bullet points highlighting impact and results"]}],
        "projects": [{"name": "string", "description": "Impact-focused project description", "highlights": ["Key achievements and results"]}],
        "skills": [{"category": "string", "skills": "Prioritized and categorized skills with proficiency levels"}],
        "education": [{"institution": "string", "degree": "string", "field_of_study": "string", "end_date": "YYYY-MM-DD", "achievements": ["Notable academic achievements"]}],
        "languages": ["string with proficiency levels"],
        "certificates": [{"name": "string", "issuing_organization": "string", "issue_date": "YYYY-MM-DD", "relevance": "string"}]
    }
}"""

        prompt = f"""IMPERATIVE: Act as a JSON data extraction API. Analyze the content of the provided resume document (passed as the next part). Extract information and structure it into a SINGLE VALID JSON object with the following structure:

{json_structure}

For the personalized section:
1. Transform raw data into achievement-focused, impact-driven content
2. Add relevant metrics and quantifiable results where possible
3. Use strong action verbs and industry-specific terminology
4. Highlight unique value propositions and career progression
5. Ensure all dates are in YYYY-MM-DD, YYYY-MM or YYYY format

Output ONLY the JSON object starting with {{ and ending with }}.
--- STRUCTURED JSON OUTPUT ---
"""
        # --- End Prompt ---

        # --- Step 4: Call AI with Prompt + Part ---
        model_name = "gemini-1.5-flash-latest"
        print(f"Calling Gemini model ({model_name}) to parse file content...")

        # Pass the prompt string AND the created Part object in the contents list
        response = client.models.generate_content(
            model=f"models/{model_name}",
            contents=[prompt, resume_part],
        )
        print("Gemini parsing response received.")

        # --- Step 5: Process Response (Improved Handling) ---
        print("Processing AI response...")
        generated_text = None  # Default to None

        # 1. Check for blocking feedback safely
        try:
            if (
                hasattr(response, "prompt_feedback")
                and response.prompt_feedback
                and response.prompt_feedback.block_reason
            ):
                block_reason_str = str(response.prompt_feedback.block_reason)
                print(f"Parsing blocked. Reason: {block_reason_str}")
                # Clean up file before returning error
                if "google_file" in locals() and google_file:
                    client.files.delete(name=google_file.name)
                return None  # Indicate failure
        except AttributeError:
            print("AttributeError checking prompt_feedback, proceeding...")
            pass
        except Exception as e:
            print(
                f"Unexpected error checking prompt_feedback: {type(e).__name__} - {e}"
            )
            pass

        # 2. Attempt to extract text using the .text attribute
        try:
            if hasattr(response, "text"):
                generated_text = response.text
                if generated_text:
                    print("Successfully extracted text using response.text.")
                    # Proceed to Step 6 (Parsing) below
                else:
                    print(
                        f"Warning: response.text exists but is empty/None. Candidates: {getattr(response, 'candidates', 'N/A')}"
                    )
                    if "google_file" in locals() and google_file:
                        client.files.delete(name=google_file.name)
                    return None  # Return None for empty text
            else:
                print(
                    f"Warning: response object lacks .text attribute. Candidates: {getattr(response, 'candidates', 'N/A')}"
                )
                if "google_file" in locals() and google_file:
                    client.files.delete(name=google_file.name)
                return None  # Return None if text attribute missing

        except ValueError as e:
            print(
                f"ValueError extracting response.text: {e}. Candidates: {getattr(response, 'candidates', 'N/A')}"
            )
            if "google_file" in locals() and google_file:
                client.files.delete(name=google_file.name)
            return None
        except Exception as e:
            print(
                f"Unexpected error extracting response text: {type(e).__name__} - {e}"
            )
            if "google_file" in locals() and google_file:
                client.files.delete(name=google_file.name)
            return None

        # --- If we got here, generated_text should be valid ---
        if generated_text is None:
            print("Error: Failed to extract valid text from AI response after checks.")
            if "google_file" in locals() and google_file:
                client.files.delete(name=google_file.name)
            return None

        # --- Step 6: Clean and Parse JSON ---
        # (Reuse clean_and_parse_json logic or keep inline logic)
        # ... cleaning logic ...
        # ... json.loads(...) ...
        # Placeholder - ensure clean_and_parse_json handles its own errors/returns None
        cleaned_json_string = (
            generated_text.strip()
            .removeprefix("```json")
            .removeprefix("```")
            .removesuffix("```")
            .strip()
        )
        if not cleaned_json_string:
            if "google_file" in locals() and google_file:
                client.files.delete(name=google_file.name)
            return None

        try:
            parsed_data = json.loads(cleaned_json_string)
            print("Successfully parsed resume content from AI.")
            # --- Step 7: Clean up uploaded file --- (Moved here, after successful parse)
            if "google_file" in locals() and google_file:
                try:
                    print(f"Deleting temporary file from Google: {google_file.name}")
                    client.files.delete(name=google_file.name)
                except Exception as del_e:
                    print(
                        f"Warning: Failed to delete temporary file {google_file.name}: {del_e}"
                    )
            # --- End Cleanup ---
            return parsed_data  # Return the parsed dictionary
        except json.JSONDecodeError as e:
            print(f"ERROR parsing AI JSON output: {e}")
            print("\n--- String Attempted to Parse ---\n")
            print(cleaned_json_string[:1000])
            if "google_file" in locals() and google_file:
                client.files.delete(name=google_file.name)
            return None

    except Exception as e:  # Catch errors during AI call itself
        print(f"ERROR during AI parsing call: {type(e).__name__} - {e}")
        if "google_file" in locals() and google_file:
            try:
                client.files.delete(name=google_file.name)
            except Exception as del_e:
                print(f"Warning: Failed cleanup delete after AI error: {del_e}")
        return None
