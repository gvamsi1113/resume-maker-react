/**
 * Provides a string representation of the expected JSON schema for the resume data.
 * Used primarily for reference or potentially for validation instructions in prompts.
 * @type {string}
 */
export const jsonSchemaExample = `{
    "basics": {
        "name": "",
        "label": "",
        "email": "",
        "phone": "",
        "url": "",
        "location": { "city": "", "region": "" },
        "profiles": [ { "network": "", "username": "", "url": "" } ],
        "summary": ""
    },
    "work": [
        {
            "name": "Company",
            "position": "Title",
            "url": "",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM or Present",
            "story": null,
            "highlights": []
        }
    ],
    "education": [
        {
            "institution": "",
            "area": "",
            "studyType": "",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM or Present",
            "gpa": ""
        }
    ],
    "skills": [
        {
            "name": "Category",
            "keywords": []
        }
    ],
    "projects": [
        {
            "name": "Project Name",
            "description": "",
            "url": "",
            "keywords": []
        }
    ],
    "certificates": [],
    "languages": []
}`;
