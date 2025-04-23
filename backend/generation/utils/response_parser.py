# backend/generation/utils/response_parser.py
import json
import re


def clean_and_parse_json(ai_response_text: str) -> dict | None:
    """
    Cleans potential markdown fences and parses the JSON string.
    Returns the parsed dictionary or None if parsing fails.
    """
    if not ai_response_text:
        print("Error: Received empty string from AI.")
        return None

    cleaned_json_string = ai_response_text.strip()
    # Enhanced regex to find JSON block, handles potential leading/trailing text
    match = re.search(
        r"```(?:json)?\s*(\{.*?\})\s*```",
        cleaned_json_string,
        re.DOTALL | re.IGNORECASE,
    )
    json_to_parse = None

    if match:
        json_to_parse = match.group(
            1
        ).strip()  # Group 1 is the content inside ```json ... ```
    elif cleaned_json_string.startswith("{") and cleaned_json_string.endswith("}"):
        # Assume the whole string is JSON if it starts/ends with braces
        json_to_parse = cleaned_json_string
    else:
        # Fallback: try to find the first '{' and last '}'
        first_brace = cleaned_json_string.find("{")
        last_brace = cleaned_json_string.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            json_to_parse = cleaned_json_string[first_brace : last_brace + 1]
            print(
                "Warning: Parsed JSON by finding first/last braces. Result might be incomplete."
            )
        else:
            print("Error: Cannot reliably find JSON object in AI response.")
            print("\n--- Raw AI Response Snippet ---\n")
            print(ai_response_text[:1000])
            return None

    if not json_to_parse:
        print("Error: JSON string is empty after cleaning attempts.")
        return None

    try:
        parsed_data = json.loads(json_to_parse)
        print("Successfully parsed generated JSON.")
        # Basic validation: Check if expected keys exist
        expected_keys = {"summary", "work", "projects", "skills"}
        if not expected_keys.issubset(parsed_data.keys()):
            print(
                f"Warning: Parsed JSON missing some expected keys. Found: {list(parsed_data.keys())}"
            )
        return parsed_data
    except json.JSONDecodeError as e:
        print(f"ERROR - Failed to parse AI JSON output: {e}")
        print("\n--- String Attempted to Parse ---\n")
        print(json_to_parse[:1000])
        return None
