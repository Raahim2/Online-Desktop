import os
import re
import requests
import base64
import random
import uuid
import time # Import time for potential delays
from dotenv import load_dotenv
load_dotenv()

# --- Configuration ---
GITHUB_TOKEN = os.getenv("REPO_GITHUB_TOKEN")
API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_IDEA = "gemini-1.5-pro-latest" # Model for generating the idea
GEMINI_MODEL_CODE = "gemini-1.5-pro-latest" # Model for generating the code (Using 1.5 pro as 2.5 is experimental/may not exist)
TARGET_REPO_URL = "https://github.com/Raahim2/Online-Desktop" # Your repo URL
TARGET_BRANCH = "master" # Or your specific branch
COMMIT_PATH_PREFIX = "public/projects/BIN/" # Path within the repo for projects
HISTORY_FILE_PATH = "PROJECT_HISTORY.txt" # Path for the history file (relative to repo root)
MAX_HISTORY_ITEMS = 50 # Limit the number of history items included in the prompt

# --- Helper Functions ---

def slugify(text):
    """Converts a string to a URL-friendly slug."""
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    text = re.sub(r'[-\s]+', '-', text)
    return text

def clean_gemini_code_output(raw_code):
    """Removes potential markdown fences and leading/trailing whitespace."""
    if not raw_code:
        return ""
    # Remove ```html ... ``` or ``` ... ``` blocks
    cleaned_code = re.sub(r'^```(?:html|HTML)?\s*\n', '', raw_code.strip(), flags=re.IGNORECASE)
    cleaned_code = re.sub(r'\n```\s*$', '', cleaned_code)
    # Basic check if it looks like HTML
    if not cleaned_code.strip().startswith(('<!DOCTYPE', '<html')):
         print("Warning: Cleaned code doesn't start with standard HTML tags. Review output.")
         # Add <!DOCTYPE html> if missing and it looks like partial html
         if cleaned_code.strip().startswith('<'):
              cleaned_code = "<!DOCTYPE html>\n" + cleaned_code
    return cleaned_code.strip()

def get_repo_details(repo_url):
    """Extracts username and repo name from URL."""
    match = re.search(r'github\.com/([^/]+)/([^/]+)', repo_url)
    if not match:
        return None, None
    username = match.group(1)
    repo_name = match.group(2).replace(".git", "")
    return username, repo_name

def get_github_file_content(token, repo_url, branch, file_path):
    """Fetches content and SHA of a file from GitHub."""
    if not token:
        print("Error: GitHub token not provided for getting file content.")
        return None, None

    username, repo_name = get_repo_details(repo_url)
    if not username:
        print(f"Error: Invalid GitHub repository URL: {repo_url}")
        return None, None

    api_url = f'https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}'
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    try:
        response = requests.get(api_url, headers=headers, params={'ref': branch})
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)

        if response.status_code == 200:
            data = response.json()
            content_encoded = data.get('content')
            sha = data.get('sha')
            if content_encoded and sha:
                content_decoded = base64.b64decode(content_encoded).decode('utf-8')
                print(f"Successfully fetched '{file_path}'. SHA: {sha}")
                return content_decoded, sha
            else:
                 print(f"Warning: Fetched file '{file_path}' but content or SHA missing in response.")
                 return None, None # Or handle differently if needed
        else:
            # This part might not be reached due to raise_for_status, but good practice
            print(f"Error fetching file '{file_path}'. Status: {response.status_code}")
            return None, None

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            print(f"File '{file_path}' not found in branch '{branch}'. Assuming empty history.")
            return None, None # File doesn't exist, valid case for history
        else:
            print(f"HTTP Error fetching file '{file_path}': {e.response.status_code} {e.response.text}")
            return None, None
    except requests.exceptions.RequestException as e:
        print(f"Network Error fetching file '{file_path}': {e}")
        return None, None
    except Exception as e:
        print(f"Unexpected error fetching file '{file_path}': {e}")
        return None, None


def commit_to_github(token, repo_url, branch, file_path, commit_message, content, current_sha=None):
    """Commits content to GitHub, creating or updating the file."""
    if not token:
        return {'status': 'failure', 'error': 'GitHub token not provided.'}
    if not content:
        # Allow committing empty history file initially, but maybe warn for project files
        if COMMIT_PATH_PREFIX in file_path:
             print(f"Warning: Content for project file '{file_path}' is empty. Committing anyway.")
        # return {'status': 'failure', 'error': 'Content is empty, cannot commit.'} # Original check

    username, repo_name = get_repo_details(repo_url)
    if not username:
        return {'status': 'failure', 'error': 'Invalid GitHub repository URL'}

    api_url = f'https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}'
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    # If current_sha isn't provided, try fetching it (useful if called directly without pre-fetch)
    if current_sha is None:
        print(f"SHA not provided for '{file_path}', attempting to fetch...")
        _, fetched_sha = get_github_file_content(token, repo_url, branch, file_path)
        if fetched_sha:
            current_sha = fetched_sha
            print(f"Found existing SHA: {current_sha}")
        elif fetched_sha is None:
             print(f"File '{file_path}' likely doesn't exist or fetch failed. Proceeding with creation.")
        # If fetch failed but wasn't 404, maybe add more robust error handling here


    encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')
    data = {
        'message': commit_message,
        'content': encoded_content,
        'branch': branch
    }
    if current_sha:
        data['sha'] = current_sha

    try:
        put_response = requests.put(api_url, headers=headers, json=data)
        put_response.raise_for_status() # Raise HTTPError for bad responses

        commit_sha = put_response.json().get('commit', {}).get('sha', 'N/A')
        action = "updated" if current_sha else "created"
        print(f"Successfully {action} '{file_path}' in branch '{branch}'. Commit SHA: {commit_sha}")
        return {'status': 'success', 'details': put_response.json()}

    except requests.exceptions.HTTPError as e:
        print(f"Commit failed for '{file_path}': {e.response.status_code}")
        print(f"Response: {e.response.text}")
        # Specific check for SHA mismatch (409 Conflict)
        if e.response.status_code == 409:
            print("Error: SHA mismatch (409 Conflict). The file may have been updated since the SHA was fetched.")
            return {'status': 'failure', 'error': f'SHA mismatch (409 Conflict): {e.response.json()}'}
        elif e.response.status_code == 422: # Unprocessable Entity - often bad content or structure
             print("Error: Unprocessable Entity (422). Check commit data/content.")
             return {'status': 'failure', 'error': f'Unprocessable Entity (422): {e.response.json()}'}
        else:
            return {'status': 'failure', 'error': f'HTTP Error {e.response.status_code}: {e.response.json()}'}
    except requests.exceptions.RequestException as e:
        print(f"Network error during commit for '{file_path}': {e}")
        return {'status': 'failure', 'error': f'Network error: {e}'}
    except Exception as e:
        print(f"Unexpected error during commit for '{file_path}': {e}")
        return {'status': 'failure', 'error': f'Unexpected error: {e}'}


def gemini(prompt, gemini_api_key=API_KEY, model="gemini-1.5-pro-latest", temperature=0.7, top_p=1.0):
    """Function to interact with the Gemini API."""
    # (Keep the gemini function exactly as it was in the original prompt - it's robust)
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY not found.")
        return None

    try:
        # Use v1beta endpoint which seems more reliable for some configs
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": gemini_api_key}
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "topP": top_p,
                 "maxOutputTokens": 8192, # Explicitly set max tokens if needed
            }
            # Optional: Adjust safety settings if needed
            # "safetySettings": [ ... ]
        }

        response = requests.post(url, headers=headers, params=params, json=payload, timeout=300) # Increased timeout
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        result = response.json()

        # Check for successful response structure
        if 'candidates' in result and result['candidates']:
            candidate = result['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content'] and candidate['content']['parts']:
                 # Strip potential leading/trailing quotes sometimes added by models
                 return candidate['content']['parts'][0]['text'].strip('" ')
            elif 'finishReason' in candidate and candidate['finishReason'] != 'STOP':
                 print(f"Warning: Generation finished unexpectedly. Reason: {candidate['finishReason']}")
                 if 'safetyRatings' in candidate:
                     print(f"Safety Ratings: {candidate['safetyRatings']}")
                 # Attempt to return partial content if available (sometimes in safety cases)
                 if 'content' in candidate and 'parts' in candidate['content'] and candidate['content']['parts']:
                    print("Returning potentially partial content due to finish reason.")
                    return candidate['content']['parts'][0]['text'].strip('" ')
                 return None # Indicate potential issue
            else:
                 print("Error: Unexpected response structure (missing content/parts or empty parts):")
                 print(result)
                 return None
        # Handle cases where response might be 200 but contains an error (e.g., prompt blocked)
        elif 'promptFeedback' in result and 'blockReason' in result['promptFeedback']:
             print(f"Error: Prompt blocked. Reason: {result['promptFeedback']['blockReason']}")
             if 'safetyRatings' in result['promptFeedback']:
                 print(f"Safety Ratings: {result['promptFeedback']['safetyRatings']}")
             return None
        else:
            print("Error: Unexpected API response structure:")
            print(result)
            return None

    except requests.exceptions.Timeout:
        print(f"Error: API request timed out after 300 seconds for model {model}.")
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
        traceback.print_exc() # Print full traceback for debugging
        return None

def extract_idea_summary(full_idea_text):
    """Extracts a concise summary (e.g., first line) from the generated idea."""
    if not full_idea_text:
        return "Unknown Project Idea"
    lines = full_idea_text.strip().split('\n')
    # Try to find a line starting with "Project Name:" or similar, otherwise take the first non-empty line
    for line in lines:
        if line.strip().lower().startswith("project name:"):
            return line.strip() # Return the whole line
    # Fallback to the first non-empty line
    for line in lines:
        if line.strip():
            return line.strip()
    return "Unnamed Project Idea" # Fallback if all lines are empty


# --- Main Execution ---

def generate_project():
    # 1. Fetch Project History from GitHub
    print(f"\nFetching project history from '{HISTORY_FILE_PATH}'...")
    history_content, history_sha = get_github_file_content(
        token=GITHUB_TOKEN,
        repo_url=TARGET_REPO_URL,
        branch=TARGET_BRANCH,
        file_path=HISTORY_FILE_PATH
    )

    past_ideas = []
    if history_content:
        # Split by newline, remove empty lines, strip whitespace
        past_ideas = [line.strip() for line in history_content.splitlines() if line.strip()]
        print(f"Found {len(past_ideas)} historical project ideas.")
        if len(past_ideas) > MAX_HISTORY_ITEMS:
            print(f"Limiting history sent to AI to the last {MAX_HISTORY_ITEMS} items.")
            past_ideas = past_ideas[-MAX_HISTORY_ITEMS:] # Keep only the most recent N ideas
    else:
        print("No history found or file doesn't exist.")

    # 2. Generate a Unique Project Idea, considering history
    print("\nGenerating project idea...")

    history_prompt_section = ""
    if past_ideas:
        history_prompt_section = "Here are some project ideas that have already been generated. Please provide something distinctly different from these:\n\n"
        history_prompt_section += "\n".join([f"- {idea}" for idea in past_ideas])
        history_prompt_section += "\n\nPlease ensure the new idea is novel compared to the list above."
        history_prompt_section += "\n---\n" # Separator

    idea_generation_prompt = f"""
    {history_prompt_section}
    Give me an innovative and easily implementable project idea for a one-page website using only HTML, Tailwind CSS, and vanilla JavaScript.
    The project MUST NOT require any API keys or external services beyond the Tailwind CDN.

    **Output Format:**
    Please format the output EXACTLY like this:
    Project Name: [A Creative and Unique Project Name]
    Description: [A short, compelling description of the project (1-2 sentences)]
    Features:
    - [Feature 1]
    - [Feature 2]
    - [Feature 3+]
    (List 3-5 key features implementable with HTML/Tailwind/minimal JS)

    **IMPORTANT:** Do NOT include any other text, greetings, explanations, or markdown formatting around this structure. Just provide the Name, Description, and Features as specified. Make the idea distinct from any provided history.
    """

    project_idea_full = gemini(
        idea_generation_prompt,
        model=GEMINI_MODEL_IDEA,
        temperature=0.95, # Keep high for creativity
        top_p=0.9
    )

    if not project_idea_full:
        print("Failed to generate a project idea. Exiting.")
        return # Use return instead of exit() for better flow control if called as function

    project_idea_full = project_idea_full.strip().strip('"') # Basic cleaning
    print(f"\nGenerated Raw Project Idea:\n---\n{project_idea_full}\n---")

    # Extract a concise summary for history and commit messages
    idea_summary = extract_idea_summary(project_idea_full)
    print(f"Extracted Idea Summary for history/commit: '{idea_summary}'")

    # 3. Generate Code based on the full idea description
    code_generation_prompt = f"""
    Generate the complete HTML code for a single-page website based on this specific project idea:

    {project_idea_full}

    **Strict Requirements:**

    1.  **Single File Output:** The entire code MUST be contained within a single HTML file (`.html`).
    2.  **HTML & Tailwind CSS Only:** Use only standard HTML5 and Tailwind CSS for ALL styling. Include Tailwind via its CDN script: `<script src="https://cdn.tailwindcss.com"></script>` within the `<head>`. Do NOT use external CSS files or `<style>` blocks unless absolutely necessary for very specific, minor tweaks not achievable with Tailwind classes.
    3.  **UI/UX Focus:** Prioritize a clean, visually appealing, and intuitive user interface. Make it look polished and modern. Use appropriate Tailwind utilities for layout (Flexbox, Grid), spacing, typography, colors, effects, and potentially subtle animations/transitions.
    4.  **Responsiveness:** The layout MUST be fully responsive (mobile, tablet, desktop). Use Tailwind's responsive modifiers (`sm:`, `md:`, `lg:`). Test basic responsiveness in your generation logic.
    5.  **Clean & Structured Code:** Write well-formatted, readable HTML with semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` etc.). Use comments only where essential.
    6.  **Placeholder Content:** Use relevant placeholder text and images (`https://via.placeholder.com/...' or similar like placeholder.co) that fit the project's theme.
    7.  **Interactivity (Optional but Encouraged):** If the project idea suggests interactivity suitable for vanilla JS (e.g., toggles, simple calculations, dynamic text updates), implement it using minimal inline JavaScript (`onclick="..."`) or a small `<script>` tag at the end of the `<body>`. AVOID complex JS logic or external libraries. Keep it simple and focused on enhancing the UI based on the idea.
    8.  **COMPLETE CODE ONLY:** Output ONLY the raw, complete HTML code starting from `<!DOCTYPE html>` and ending with `</html>`. Do NOT include:
        *   Any explanations before or after the code.
        *   Any descriptive text about the code (like "Here is the HTML code...").
        *   Markdown formatting like ```html ... ``` surrounding the code block.
        *   Any conversational text.

    Begin the HTML code now:
    """

    print("\nGenerating HTML code based on the idea...")
    raw_code = gemini(code_generation_prompt, model=GEMINI_MODEL_CODE, temperature=0.4) # Lower temp for code

    if not raw_code:
        print("Failed to generate the code. Exiting.")
        return

    # 4. Clean the Generated Code
    print("\nCleaning generated code...")
    cleaned_code = clean_gemini_code_output(raw_code)

    if not cleaned_code or not cleaned_code.strip():
        print("Code cleaning resulted in empty content. Cannot proceed. Exiting.")
        return

    print("\nCleaned Code Snippet (first 500 chars):")
    print(cleaned_code[:500] + "...")
    print("-" * 20)

    # --- Commit Phase ---

    unique_id = uuid.uuid4()
    # Use a random theme or keyword if needed, or remove if idea_summary is enough
    random_theme = random.choice(["innovation", "utility", "design", "interactive", "concept"])
    project_file_path = f"{COMMIT_PATH_PREFIX.strip('/')}/{unique_id}.html"
    project_commit_message = f"feat: Add project '{idea_summary[:50]}...' ({random_theme}) ({unique_id})"

    # 5. Update Project History on GitHub BEFORE committing the project file
    print(f"\nAttempting to update history file '{HISTORY_FILE_PATH}'...")
    new_history_content = (history_content + "\n" + idea_summary).strip() # Append new summary

    history_commit_message = f"chore: Update project history with '{idea_summary[:50]}...'"

    history_commit_result = commit_to_github(
        token=GITHUB_TOKEN,
        repo_url=TARGET_REPO_URL,
        branch=TARGET_BRANCH,
        file_path=HISTORY_FILE_PATH,
        commit_message=history_commit_message,
        content=new_history_content,
        current_sha=history_sha # Pass the SHA obtained earlier for update
    )

    print("\nHistory Commit Result:")
    print(history_commit_result)

    if history_commit_result['status'] != 'success':
        print(f"Warning: Failed to update history file '{HISTORY_FILE_PATH}'. Proceeding with project commit anyway.")
       

    time.sleep(2)

    # 6. Commit the Generated Project Code to GitHub
    print(f"\nAttempting to commit project file to: {TARGET_REPO_URL}")
    print(f"File path: {project_file_path}")
    print(f"Branch: {TARGET_BRANCH}")
    print(f"Commit message: {project_commit_message}")

    project_commit_result = commit_to_github(
        token=GITHUB_TOKEN,
        repo_url=TARGET_REPO_URL,
        branch=TARGET_BRANCH,
        file_path=project_file_path,
        commit_message=project_commit_message,
        content=cleaned_code
        # No SHA needed here, as it's a new file with UUID
    )

    print("\nProject Commit Result:")
    print(project_commit_result)

    if project_commit_result['status'] == 'success':
        print("\nProcess completed successfully! New project and history updated.")
    else:
        print("\nProcess failed during project commit.")

# --- Run the generator ---
if __name__ == "__main__":
    # Basic check for essential env vars
    if not GITHUB_TOKEN or not API_KEY:
        print("Error: Missing GITHUB_TOKEN or GEMINI_API_KEY environment variables.")
        print("Please ensure your .env file is correctly set up.")
    else:
        generate_project()