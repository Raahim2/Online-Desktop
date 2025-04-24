import os
import re
import requests
import base64
import uuid # Keep for potential unique naming if needed later
from dotenv import load_dotenv
import argparse # To easily pass the input file path

load_dotenv()

# --- Configuration ---
GITHUB_TOKEN = os.getenv("REPO_GITHUB_TOKEN") # Needed only if committing upgrades
API_KEY = os.getenv("GEMINI_API_KEY")
# Use a powerful model capable of understanding and modifying existing code
GEMINI_MODEL_UPGRADE = "gemini-1.5-pro-latest" # Or "gemini-2.5-pro-exp-03-25" if preferred
# Optional: For committing upgraded files
TARGET_REPO_URL = "https://github.com/Raahim2/Online-Desktop"
TARGET_BRANCH = "master"
COMMIT_PATH_PREFIX = "public/projects/BIN/" # Or a different path for upgrades?

# --- Helper Functions (Reuse from binbot.py) ---

def clean_gemini_code_output(raw_code):
    """Removes potential markdown fences and leading/trailing whitespace."""
    if not raw_code:
        return ""
    # Remove ```html ... ``` or ``` ... ``` blocks
    cleaned_code = re.sub(r'^```(?:html)?\s*\n', '', raw_code.strip())
    cleaned_code = re.sub(r'\n```\s*$', '', cleaned_code)
    # Basic check if it looks like HTML
    if not cleaned_code.strip().startswith(('<!DOCTYPE', '<html')):
         print("Warning: Cleaned code doesn't start with standard HTML tags. Review output.")
         # Add <!DOCTYPE html> if missing and it looks like partial html
         if cleaned_code.strip().startswith('<'):
              cleaned_code = "<!DOCTYPE html>\n" + cleaned_code
    return cleaned_code.strip()

def commit_to_github(token, repo_url, branch, file_path, commit_message, content):
    """Commits content to a GitHub repository, creating or updating the file."""
    # (Keep the function identical to binbot.py's version)
    if not token:
        return {'status': 'failure', 'error': 'GitHub token not provided.'}
    if not content:
        return {'status': 'failure', 'error': 'Content is empty, cannot commit.'}

    match = re.search(r'github\.com/([^/]+)/([^/]+)', repo_url)
    if not match:
        return {'status': 'failure', 'error': 'Invalid GitHub repository URL'}

    username = match.group(1)
    repo_name = match.group(2).replace(".git", "")

    api_url = f'https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}'

    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    # 1. Check if file exists and get SHA
    sha = None
    get_response = requests.get(api_url, headers=headers, params={'ref': branch})

    if get_response.status_code == 200:
        sha = get_response.json().get('sha')
        print(f"File '{file_path}' exists. SHA: {sha}")
    elif get_response.status_code == 404:
        print(f"File '{file_path}' does not exist. Will create.")
    else:
        return {'status': 'failure', 'error': f'Failed to get file info: {get_response.status_code} {get_response.text}'}

    # 2. Prepare commit data
    encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')

    data = {
        'message': commit_message,
        'content': encoded_content,
        'branch': branch
    }
    if sha:  # If updating, provide the SHA
        data['sha'] = sha

    # 3. Make the PUT request to create or update
    put_response = requests.put(api_url, headers=headers, json=data)

    if put_response.status_code in [200, 201]:
        commit_sha = put_response.json().get('commit', {}).get('sha', 'N/A')
        print(f"Successful commit to {branch}. Commit SHA: {commit_sha}")
        return {'status': 'success', 'details': put_response.json()}
    else:
        print(f"Commit failed: {put_response.status_code}")
        print(f"Response: {put_response.text}")
        return {'status': 'failure', 'error': put_response.json()}


def gemini(prompt, gemini_api_key=API_KEY, model="gemini-2.5-pro-exp-03-25", temperature=0.7, top_p=1.0):
    """
    Function to interact with the Gemini API.
    (Keep the function identical to binbot.py's version)
    """
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY not found.")
        return None

    try:
        # Use v1beta endpoint as it often has newer models/features like potentially larger context
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": gemini_api_key}
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "topP": top_p,
                 # Optional: Consider increasing max output tokens if upgrades might be complex
                 # "maxOutputTokens": 8192,
            }
            # Optional: Adjust safety settings if needed
            # "safetySettings": [ ... ]
        }

        response = requests.post(url, headers=headers, params=params, json=payload)
        response.raise_for_status() # Raise an exception for bad status codes

        result = response.json()

        # Handle potential response structures and errors (same logic as binbot.py)
        if 'candidates' in result and result['candidates']:
             if 'content' in result['candidates'][0] and 'parts' in result['candidates'][0]['content']:
                 return result['candidates'][0]['content']['parts'][0]['text'].strip('" ')
             elif 'finishReason' in result['candidates'][0] and result['candidates'][0]['finishReason'] != 'STOP':
                 print(f"Warning: Generation finished unexpectedly. Reason: {result['candidates'][0]['finishReason']}")
                 if 'safetyRatings' in result['candidates'][0]:
                     print(f"Safety Ratings: {result['candidates'][0]['safetyRatings']}")
                 return None
             else:
                 print("Error: Unexpected response structure (missing content/parts):")
                 print(result)
                 return None
        elif 'promptFeedback' in result and 'blockReason' in result['promptFeedback']:
             print(f"Error: Prompt blocked. Reason: {result['promptFeedback']['blockReason']}")
             if 'safetyRatings' in result['promptFeedback']:
                 print(f"Safety Ratings: {result['promptFeedback']['safetyRatings']}")
             return None
        else:
            print("Error: Unexpected API response structure:")
            print(result)
            return None

    except requests.exceptions.RequestException as e:
        print(f"HTTP Request Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response Status Code: {e.response.status_code}")
            print(f"Response Text: {e.response.text}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred in gemini function: {e}")
        import traceback
        traceback.print_exc()
        return None

# --- Main Upgrade Execution ---

def upgrade_project(input_html_path):
    """Reads an HTML file, asks Gemini to upgrade it, and saves the result."""

    print(f"Attempting to upgrade project file: {input_html_path}")

    # 1. Validate input file
    if not os.path.exists(input_html_path):
        print(f"Error: Input file not found at '{input_html_path}'")
        return
    if not input_html_path.lower().endswith(".html"):
        print(f"Error: Input file '{input_html_path}' does not appear to be an HTML file.")
        return

    # 2. Read the original HTML content
    try:
        with open(input_html_path, 'r', encoding='utf-8') as f:
            original_html_content = f.read()
        print(f"Successfully read {len(original_html_content)} characters from the input file.")
    except Exception as e:
        print(f"Error reading file '{input_html_path}': {e}")
        return

    if not original_html_content.strip():
        print("Error: Input HTML file is empty.")
        return

    # 3. Construct the Upgrade Prompt
    # This prompt needs to guide the AI effectively.
    upgrade_prompt = f"""
You are an expert web developer tasked with *enhancing* and *expanding* upon an existing HTML webpage, making it objectively better and more feature-rich.

**CRITICAL INSTRUCTION: DO NOT REMOVE existing functionality, content sections, or major visual elements from the original code.** Your goal is to ADD TO and IMPROVE upon the existing base, not simplify or replace it. Preserve the core concept and features.

**Analysis of Original Code:**
(Mentally analyze the provided code below to understand its purpose, structure, existing features, and visual style.)

**Upgrade Mandate:**

1.  **Add New Features/Content:** Introduce at least one significant new feature, interactive element, or content section that logically builds upon the original concept. Examples:
    *   If it's a display, add sorting/filtering options (even if just placeholders).
    *   If it's static, add subtle hover effects, transitions, or a simple tabbed interface.
    *   If it shows data, add more data points or a complementary visualization.
    *   Add a relevant new section (e.g., a 'details' panel, a 'settings' mock-up, an 'about' section).
    *   Incorporate more detailed placeholder text or images relevant to the theme.
2.  **Enhance UI/UX:** Improve the visual appeal and usability using Tailwind CSS *without removing existing layout*.
    *   Refine spacing, typography, and color usage for better readability and aesthetics.
    *   Ensure layout remains fully responsive, potentially improving breakpoints.
    *   Add subtle visual cues like improved button styles, clearer visual hierarchy, or better handling of overflow.
3.  **Preserve Original Functionality:** Reiterate: All original interactive elements (if any) and content structures must remain functional and present in the upgraded version.
4.  **Strict Technical Constraints:**
    *   **Single File Output:** The entire upgraded code MUST be in one single HTML file.
    *   **HTML & Tailwind CSS Only:** Use only standard HTML5 and Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`). No external CSS or significant `<style>` blocks. Minimal inline JS (`onclick`, etc.) or a small embedded `<script>` at the end of `<body>` is acceptable ONLY for the *newly added* enhancements, if essential.
    *   **Clean Code:** Output well-formatted, readable HTML.
5.  **OUTPUT COMPLETE CODE ONLY:** Start directly with `<!DOCTYPE html>` and end with `</html>`. Do NOT include explanations, markdown formatting (like ```html), commentary, or conversational text.

**Original HTML Code to Upgrade (Preserve and Enhance This):**
```html
{original_html_content}
Begin the upgraded HTML code now try to make it as good as possible by increasing the lines of code.
"""
    
    print("\nRequesting upgrade from Gemini...")
    # Use a moderate temperature - allow improvement without going completely off track
    raw_upgraded_code = gemini(upgrade_prompt, model=GEMINI_MODEL_UPGRADE, temperature=0.65)

    if not raw_upgraded_code:
        print("Failed to generate the upgraded code from Gemini. Exiting.")
        return

    # 4. Clean the Generated Upgraded Code
    print("\nCleaning generated upgraded code...")
    cleaned_upgraded_code = clean_gemini_code_output(raw_upgraded_code)

    if not cleaned_upgraded_code:
        print("Code cleaning resulted in empty content. Cannot save. Exiting.")
        return

    print("\nCleaned Upgraded Code Snippet (first 500 chars):")
    print(cleaned_upgraded_code[:500] + "...")
    print("-" * 20)

    # 5. Save the Upgraded Code to a New File
    base_name = os.path.splitext(input_html_path)[0]
    output_html_path = f"{base_name}_upgraded.html"

    try:
        with open(output_html_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_upgraded_code)
        print(f"\nSuccessfully saved upgraded project to: {output_html_path}")
    except Exception as e:
        print(f"\nError saving upgraded file '{output_html_path}': {e}")
        return

    # --- Optional: Commit the Upgraded File ---
    # Uncomment the following block if you want to automatically commit upgrades
    """
    print("\nAttempting to commit upgraded file to GitHub...")
    # Extract original filename for commit message clarity
    original_filename = os.path.basename(input_html_path)
    # Create a unique ID or use the upgraded filename for the repo path
    upgraded_filename_for_repo = os.path.basename(output_html_path)
    commit_file_path = f"{COMMIT_PATH_PREFIX.strip('/')}/{upgraded_filename_for_repo}"
    commit_message = f"feat: Upgrade project '{original_filename}'"

    print(f"Commit path: {commit_file_path}")
    print(f"Commit message: {commit_message}")

    commit_result = commit_to_github(
        token=GITHUB_TOKEN,
        repo_url=TARGET_REPO_URL,
        branch=TARGET_BRANCH,
        file_path=commit_file_path,
        commit_message=commit_message,
        content=cleaned_upgraded_code
    )
    print("\nCommit Result:")
    print(commit_result)
    """

upgrade_project("public/projects/BIN/Dash.html") # Replace with your actual file path