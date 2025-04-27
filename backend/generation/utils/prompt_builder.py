# backend/generation/utils/prompt_builder.py


def build_generation_prompt(base_data_string: str, jd_text: str) -> str:
    """
    Constructs the final prompt for the AI model using formatted base data and JD.
    """
    prompt = f"""IMPERATIVE: YOUR SOLE FUNCTION IS TO ACT AS A JSON API ENDPOINT. YOU MUST OUTPUT A SINGLE, VALID JSON OBJECT AND NOTHING ELSE. ABSOLUTELY NO MARKDOWN, EXPLANATIONS, OR ANY TEXT BEFORE THE STARTING '{{' OR AFTER THE ENDING '}}' IS PERMITTED.

**TASK:**

Parse the provided `--- BASE RESUME JSON CHUNKS ---` (Work, Skills, Projects, Summary) and `--- JOB DESCRIPTION ---`. Generate a single JSON object containing *only* the tailored `summary`, `work`, `skills`, and `projects` sections, conforming to the structure of the input JSON chunks for these sections. Tailor specific fields as instructed below based *strictly* on the `JOB DESCRIPTION`. DO NOT INCLUDE `basics` or `education` sections in your output.

**STRICT RULES:**

1.  **Input Processing:**
    *   Use the provided `--- BASE RESUME JSON CHUNKS ---` (Work, Skills, Projects, Summary) as the source data.
    *   Thoroughly analyze the `--- JOB DESCRIPTION ---` to identify keywords, required skills, technologies, company principles (if mentioned), and desired experience patterns.

2.  **Output Format:**
    *   The *entire* output MUST be a single, valid JSON object.
    *   The JSON object MUST contain *only* the following top-level keys: `summary` (as a string), `work` (as an array), `skills` (as an array), and `projects` (as an array). The structure *within* these keys MUST mirror the input JSON chunks.
    *   ABSOLUTELY DO NOT include `basics` or `education` keys or their content in the output.
    *   There must be nothing else except the JSON object. NO text, commentary, or markdown formatting preceding the opening '{' or succeeding the closing '}'.

3.  **Content - Non-Tailored Sections (Exclusion):**
    *   DO NOT process or include any information related to Basics or Education.
    *   Ensure the `work` array is ordered reverse chronologically (most recent first) as it appears in the input JSON.

4.  **Content - Tailored Sections (MANDATORY FOCUS):**
    *   Modify *only* the following JSON fields based *strictly* on the `JOB DESCRIPTION` analysis. The goal is maximum alignment with the target role.
        *   `summary` (derived from the input `Summary JSON`):
            *   **Length:** 3 concise lines ONLY.
            *   **Content:** Rewrite the summary to be a targeted pitch highlighting suitability for the *specific role* described in the `JOB DESCRIPTION`, using skills and keywords from it. Output this as a single string value for the `summary` key.
        *   `work[].highlights` (within the `Work JSON` structure):
            *   **Quantity:** 4-6 bullet points per work entry.
            *   **Structure:** MUST follow Action Verb -> Specific Task/Accomplishment -> Quantifiable Result (Metric).
            *   **Action Verbs:** Every bullet point MUST begin with a strong action verb (e.g., Led, Developed, Implemented, Optimized, Reduced, Managed, Created, Automated).
            *   **Quantify Everything:** MUST include specific, relevant, numerical metrics. Use numbers (e.g., "Reduced API latency by 30%", "Managed budget of $500K", "Increased user engagement by 15%", "Processed 10K records daily"). Ensure metrics are practical and common for the achievement described.
            *   **Tailoring (Keywords):** Each bullet MUST directly address skills, technologies, or responsibilities mentioned in the `JOB DESCRIPTION`. Prioritize keywords heavily. The original context of the highlights DOES NOT MATTER, you can rewrite the whole work hishglights absolutely tailored to the JD.
            *   **Conciseness (VERY IMPORTANT):** Bullet points MUST be brief. Strictly 185-210 characters including spaces. DO NOT BE OUT OF RANGE OF THE CHARACTER COUNT PER BULLET.
            *   **Objectivity:** STRICTLY NO first-person ("I", "me", "my", "we", "our"). Maintain an impersonal, objective tone.
            *   **No Fluff:** STRICTLY NO adverbs (e.g., successfully, effectively, efficiently, very) or vague filler words. Be direct and factual.
        *   `projects[].description` (within the `Projects JSON` structure):
            *   **Content:** Tailor the description to highlight aspects relevant to the `JOB DESCRIPTION`. Convert the tech stack and skills used and the project's impact or purpose in relation to the absolutely match the JD.

5.  **Skills Section (`skills`, from `Skills JSON`):
    *   **Content:** Start with the hard skills (technical skills, tools, languages, frameworks, methodologies) from the input `Skills JSON`. Maintain the structure (array of objects with name/keywords), remove all the irrelevant hard skills present in the base skills.
    *   **Enhancement:** Add/emphasize hard skills, tools, and technologies explicitly mentioned in the `JOB DESCRIPTION`. If a skill from the JD is present in the base skills, ensure it's prominent. If it's missing, add it. DO NOT add any fluff, just the skill, no skill level reference required. DO NOT add words like exposure, expert etc.
    *   **Categorization:** Maintain the logical grouping from the input `Skills JSON` (e.g., "Frontend", "Backend", "Databases", "Cloud", "Methodologies").

6.  **Keyword and Technology Integration (CRITICAL):**
    *   Actively identify *all* keywords, tools, and technologies present in the `JOB DESCRIPTION`.
    *   Strategically and *cleverly* integrate these terms into the tailored sections (`summary`, `work[].highlights`, `projects[].description`, `skills`).
    *   **Placement Strategy:** Place keywords where they logically fit. For example, if the JD requires "Kubernetes" and a past project involved cloud deployment, add a highlight like "Deployed microservices using Docker and Kubernetes, achieving 99.9% uptime.". make sure you follow the word count. Remove irrelevant highlights and take their context and adapt it to match the requirements of the JD. Group related technologies mentioned in the JD within relevant bullet points or project descriptions.

7.  **Company Principles Integration (If Applicable):**
    *   If the `JOB DESCRIPTION` has a company name subtly weave demonstrations of their principles (e.g., Amazon Leadership Principles, Google's values), into the content of `summary`, `work[].highlights`, and `projects[].description`.
    *   **Subtlety is Key:** Do not explicitly name the principle. Instead, show it through actions and results (e.g., for "Customer Obsession," adapt a highlight focused on improving user experience based on feedback; for "Bias for Action," describe rapidly implementing a solution). Spread these references naturally across the relevant sections.

8.  **Exclusion Focus:**
    *   Direct tailoring efforts *only* towards `summary`, `work`, `projects`, and `skills` sections based on their corresponding input JSON chunks.
    *   DO NOT INCLUDE `basics` or `education` in the output JSON.

9.  **Final Output Constraint (ABSOLUTE):** The final response MUST begin *exactly* with `{{` and end *exactly* with `}}`. No other characters, formatting, markdown, or explanations are allowed.

**FINAL CRITICAL CHECK:** Before generating the JSON, double-check EVERY bullet point in ALL `work[].highlights` arrays. EACH bullet MUST contain EXACTLY 185-210 characters including spaces. NO OTHER LENGTH IS PERMITTED. DO NOT ADD CHARACTER COUNT IN THE BULLET POINTS. DOUBLE CHECK AND REMOVE IF YOU HAVE ADDED ANY COMMENTS OR ANYTHING ELSE. IT MUST BE DIRECTLY SENDABLE TO THE COMPANY. DEAL IN ABSOLUTE WORDS. NO POTENTIAL, NO AMBIGUITY, NO VAGUE STUFF. NO EXPLANATORY TEXT. NO BRACKETS like (exposure, expert, etc).

--- USER BACKGROUND & BASE CONTENT ---
{base_data_string}

--- JOB DESCRIPTION ---
{jd_text}

--- TAILORED RESUME JSON OUTPUT (summary, work, skills, projects ONLY) ---"""

    return prompt
