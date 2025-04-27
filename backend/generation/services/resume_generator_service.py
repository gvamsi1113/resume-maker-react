# backend/generation/services/resume_generator_service.py
import os
from google import genai

# from google.genai import types # If needed later
from django.contrib.auth.models import User
from bio.models import Bio  # Import Bio model
from resumes.models import Resume  # Import Resume model

# Import utility functions using relative paths within the app
from ..utils.profile_formatter import format_base_data_for_ai_prompt
from ..utils.prompt_builder import build_generation_prompt
from ..utils.response_parser import clean_and_parse_json
from ..utils.jd_parser import extract_keywords_from_jd  # Placeholder

# --- Configure GenAI Client ---
GENAI_CONFIGURED = False
client = None  # Initialize client as None globally
try:
    # Try GOOGLE_API_KEY first, then GEMINI_API_KEY
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "API Key not found in .env (checked GOOGLE_API_KEY, GEMINI_API_KEY)"
        )

    # Use the Client constructor from the new SDK
    client = genai.Client(api_key=api_key)

    # Optional verification: Try listing a model (low cost)
    # This will raise an exception if the key is invalid or config fails
    print("Verifying GenAI config by listing models (first page)...")
    try:
        _ = next(client.models.list())
        print(_, "Successfully listed models. GenAI Client configured.")
    except StopIteration:
        print(
            "Warning: no models returned on list(), but GenAI Client appears configured."
        )
    # Even if no models were returned, assume configuration succeeded
    GENAI_CONFIGURED = True

except Exception as e:
    print(
        f"ERROR configuring or verifying Google GenAI Client: {type(e).__name__} - {e}"
    )
    client = None  # Ensure client remains None on failure
    GENAI_CONFIGURED = False


# --- Main Generation Function ---
def generate_resume_content_for_jd(user: User, jd_text: str) -> dict | str:
    """
    Orchestrates the resume generation process. Fetches Base Resume, calls AI,
    creates a NEW Resume record with generated content.
    Returns the *serialized data* of the new Resume object on success or an error message string.
    """
    if not GENAI_CONFIGURED or client is None:
        return "Error: AI Client is not configured properly."

    print(f"Starting generation for user: {user.username}")
    try:
        # --- Step 1: Fetch User's BASE Resume & Bio Data ---
        try:
            # Fetch the specific resume marked as base, include related Bio
            base_resume = (
                Resume.objects.select_related("user__bio")
                .prefetch_related(
                    "user__bio__social_profiles"  # Prefetch for formatter efficiency
                )
                .get(user=user, is_base_resume=True)
            )  # Use .get() for mandatory base
            bio = base_resume.user.bio  # Get bio from the loaded user relation
        except Resume.DoesNotExist:
            return "Error: User's Base Resume not found. Please create one first via /api/resumes/create-base/."
        except Bio.DoesNotExist:
            return "Error: User Bio not found (should not happen if signal works)."
        except Exception as e:
            print(f"Error fetching base data for user {user.username}: {e}")
            return "Error: Could not retrieve base resume data."

        # --- Step 2: Format BASE data for AI Prompt ---
        ai_input_string = format_base_data_for_ai_prompt(bio, base_resume)

        # --- Step 3: Pre-parse JD (Placeholder) ---
        # jd_keywords = extract_keywords_from_jd(jd_text)

        # --- Step 4: Build the Prompt ---
        prompt = build_generation_prompt(ai_input_string, jd_text)
        # Print the AI prompt for debugging
        print("\n--- AI Generation Prompt ---\n")
        print(prompt)
        print("\n--- End AI Generation Prompt ---\n")

        # --- Step 5: Call AI Model ---
        model_name = "gemini-1.5-flash"  # Verify model
        print(f"Calling Gemini model: {model_name}...")
        response = client.models.generate_content(
            model=model_name,  # Pass model name string directly
            contents=prompt,
        )
        print("Gemini response received.")
        # model = genai.GenerativeModel(model_name)
        # Add generation config, safety settings if needed
        # config = types.GenerationConfig(response_mime_type="application/json")

        # --- Step 6: Process AI Response (Improved) ---
        print("Processing AI response...")
        generated_text = None  # Default to None

        # 1. Check for blocking feedback safely
        try:
            # Check if feedback exists AND has a block reason
            if (
                hasattr(response, "prompt_feedback")
                and response.prompt_feedback
                and response.prompt_feedback.block_reason
            ):
                block_reason_str = str(response.prompt_feedback.block_reason)
                print(f"Generation blocked. Reason: {block_reason_str}")
                return f"Error: Content generation blocked by safety filter ({block_reason_str})."  # Return error string
        except AttributeError:
            print(
                "AttributeError checking prompt_feedback, proceeding..."
            )  # Log if attribute missing entirely
            pass  # Ignore if prompt_feedback structure is unexpected
        except Exception as e:
            print(
                f"Unexpected error checking prompt_feedback: {type(e).__name__} - {e}"
            )
            # Decide whether to proceed or return error - let's try proceeding for now
            pass

        # 2. Attempt to extract text using the .text attribute
        try:
            if hasattr(response, "text"):
                generated_text = response.text
                if generated_text:  # Check if text is not empty
                    print("Successfully extracted text using response.text.")
                    print("\n--- RAW AI Response Text Received ---\n")
                    print(generated_text)
                    print("\n--- End RAW AI Response Text ---\n")
                    # Proceed to Step 7 (Parsing) below
                else:
                    # Handle cases where .text exists but is empty/None
                    print(
                        f"Warning: response.text exists but is empty/None. Candidates: {getattr(response, 'candidates', 'N/A')}"
                    )
                    return "Error: AI returned an empty text response."
            else:
                # If .text attribute doesn't exist, maybe check candidates (less common now?)
                print(
                    f"Warning: response object lacks .text attribute. Candidates: {getattr(response, 'candidates', 'N/A')}"
                )
                # Try fallback to candidates if needed, based on SDK structure for errors
                # candidate = response.candidates[0] # Example, might error
                # generated_text = candidate.content.parts[0].text # Example, might error
                # if not generated_text: return "Error: AI response structure unexpected (no text found)."
                # else: print("Extracted text via candidates fallback.")

                # For now, return error if .text is missing
                return "Error: AI response structure missing expected 'text' attribute."

        except ValueError as e:
            # Handle cases where .text property itself raises error
            print(
                f"ValueError extracting response.text: {e}. Candidates: {getattr(response, 'candidates', 'N/A')}"
            )
            return "Error: Could not extract text from AI response value."
        except Exception as e:
            # Catch other potential errors during text extraction
            print(
                f"Unexpected error extracting response text: {type(e).__name__} - {e}"
            )
            return "Error: Unexpected issue accessing AI response text content."

        # --- If we got here, generated_text should be valid ---
        if generated_text is None:  # Should have returned error above, but double-check
            return "Error: Failed to extract valid text from AI response."

        # --- Step 7: Parse AI Response JSON ---
        print("Cleaning and parsing AI response JSON...")
        generated_data = clean_and_parse_json(generated_text)
        if generated_data is None:
            return (
                "Error: Failed to parse AI response as JSON."  # Error logged in parser
            )

        # --- Step 8: Create and Save NEW Resume Record ---
        print("Creating new Resume record...")
        try:
            # TODO: Extract company name/url from JD or request data
            company_name_from_jd = "Company from JD"  # Placeholder

            new_resume = Resume.objects.create(
                user=user,
                name=f"Resume for {company_name_from_jd}",  # Auto-generate a name
                is_base_resume=False,
                source_job_description=jd_text,
                # source_job_url= extracted_url, # Populate if available
                source_company_name=company_name_from_jd,  # Populate if available
                # Populate generated fields directly from AI output JSON
                summary=generated_data.get("summary", ""),
                work=generated_data.get("work", []),
                projects=generated_data.get("projects", []),
                skills=generated_data.get("skills", {}),
            )
            print(f"Successfully created new Resume record with ID: {new_resume.id}")

            # Return the data of the newly created resume using the merging serializer
            # This requires importing the serializer and potentially passing context
            from resumes.serializers import ResumeSerializer

            # We need the full object with prefetched Bio for the serializer to work
            # Re-fetch might be simplest here, or pass bio object if available easily
            new_resume_full = (
                Resume.objects.select_related("user__bio")
                .prefetch_related("user__bio__social_profiles")
                .get(pk=new_resume.pk)
            )
            serializer = ResumeSerializer(new_resume_full)
            return serializer.data  # Return the serialized dict

        except Exception as e:
            print(
                f"Error saving generated resume for user {user.username}: {type(e).__name__} - {e}"
            )
            # import traceback; traceback.print_exc()
            return "Error: Failed to save the generated resume data."

    except Exception as e:
        print(
            f"ERROR in generation service for user {user.username}: {type(e).__name__} - {e}"
        )
        # import traceback; traceback.print_exc()
        return f"Error: An unexpected exception occurred during generation - {type(e).__name__}"
