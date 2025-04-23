# backend/generation/utils/profile_formatter.py
from bio.models import Bio
from resumes.models import Resume  # Need Resume to format its base content


def format_base_data_for_ai_prompt(bio: Bio, base_resume: Resume) -> str:
    """
    Formats the user's Bio and BASE Resume content into a prompt string
    suitable for the AI generation task. Excludes basics/education details.
    """
    # Combine relevant fields from Bio and the base_resume object's fields
    data_str = "## User Context & Base Content:\n"

    # Info from Bio relevant for context/tailoring
    data_str += f"Headline: {bio.headline or 'N/A'}\n"
    data_str += (
        f"Target Roles: {', '.join(bio.target_roles) if bio.target_roles else 'N/A'}\n"
    )
    data_str += f"Target Industries: {', '.join(bio.target_industries) if bio.target_industries else 'N/A'}\n\n"

    # Base Content from the 'is_base_resume=True' Resume object
    data_str += f"## Base Summary:\n{base_resume.summary or 'N/A'}\n\n"  # Use summary from base resume

    data_str += "## Base Work Experience:\n"
    if base_resume.work:
        for (
            exp
        ) in (
            base_resume.work
        ):  # Iterate through the JSON list stored in base_resume.work
            start = exp.get("start_date", "N/A")
            end = exp.get("end_date", "N/A")
            current = exp.get(
                "currently_working", False
            )  # Match field names used in Resume.work JSON
            end_str = "Current" if current else end
            data_str += f"- **{exp.get('role', 'N/A')}** at **{exp.get('company', 'N/A')}** ({start} - {end_str})\n"  # Match keys
            data_str += f"  Location: {exp.get('location_city', '')}, {exp.get('location_state', '')}\n"
            # Pass original highlights from the base resume for AI context
            if exp.get("highlights"):
                data_str += f"  Original Highlights:\n"
                for highlight in exp.get("highlights", []):
                    data_str += f"  - {highlight}\n"
            # Include skills used if stored in the base resume work JSON
            if exp.get("skills_used"):
                data_str += f"  Skills Used: {', '.join(exp.get('skills_used', []))}\n"
            data_str += "\n"
    else:
        data_str += "N/A\n\n"

    data_str += "## Base Projects:\n"
    if base_resume.projects:
        for proj in base_resume.projects:  # Iterate through JSON list
            data_str += f"- **{proj.get('name', 'N/A')}** ({proj.get('role', 'N/A')})\n"
            data_str += f"  Description: {proj.get('description', 'N/A')}\n"
            if proj.get("highlights"):
                data_str += f"  Original Highlights:\n"
                for highlight in proj.get("highlights", []):
                    data_str += f"  - {highlight}\n"
            data_str += "\n"
    else:
        data_str += "N/A\n\n"

    # Base Skills (From Base Resume Record)
    data_str += "## Base Skills:\n"
    if base_resume.skills:
        for category, skills_list in base_resume.skills.items():  # Iterate through dict
            data_str += f"- **{category}:** {', '.join(skills_list)}\n"
    else:
        data_str += "N/A\n\n"

    # Languages & Certificates (From Bio - still relevant context)
    if bio.base_languages_json:
        data_str += "## Languages:\n"
        data_str += ", ".join(bio.base_languages_json) + "\n\n"
    if bio.base_certificates_json:
        data_str += "## Certificates:\n"
        for cert in bio.base_certificates_json:
            name = cert.get("name", "N/A")
            org = cert.get("issuing_organization", "")
            date = cert.get("issue_date", "")
            data_str += f"- {name}{' from ' + org if org else ''}{' (' + date + ')' if date else ''}\n"
        data_str += "\n"

    return data_str.strip()
