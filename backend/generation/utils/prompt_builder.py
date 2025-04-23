# backend/generation/utils/prompt_builder.py


def build_generation_prompt(base_data_string: str, jd_text: str) -> str:
    """
    Constructs the final prompt for the AI model using formatted base data and JD.
    """
    # --- PASTE YOUR FULL, DETAILED PROMPT INSTRUCTIONS HERE ---
    # This is the core instruction set for the AI.
    # Use f-string formatting. Include placeholders {base_data_string} and {jd_text}.
    # Ensure rules match the input format (single block) and desired JSON output.
    prompt = f"""IMPERATIVE: YOUR SOLE FUNCTION IS TO ACT AS A JSON API ENDPOINT. YOU MUST OUTPUT A SINGLE, VALID JSON OBJECT AND NOTHING ELSE... [YOUR FULL PROMPT TEXT]...

--- USER BACKGROUND & BASE CONTENT ---
{base_data_string}

--- JOB DESCRIPTION ---
{jd_text}

--- TAILORED RESUME JSON OUTPUT (summary, work, skills, projects ONLY) ---"""
    # --- END OF PROMPT TEXT ---

    return prompt
