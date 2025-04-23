# backend/generation/utils/jd_parser.py
# Placeholder for Job Description parsing logic


def extract_keywords_from_jd(jd_text: str) -> list:
    """Placeholder function for JD keyword extraction."""
    print("Warning: JD Parsing not implemented yet. Using basic split.")
    try:
        # Replace with actual NLP/AI logic later
        words = jd_text.lower().split()
        keywords = [w.strip('.,!?:;"()[]') for w in words if len(w) > 3 and w.isalnum()]
        return list(set(keywords[:30]))  # Return more keywords
    except Exception as e:
        print(f"Error in basic JD keyword extraction: {e}")
        return []


# TODO: Add more functions later (e.g., extract_required_skills, get_company_tone)
