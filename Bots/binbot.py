import os
import re
import requests
import base64
import uuid
import time
import json
from dotenv import load_dotenv
load_dotenv()

# --- Configuration ---
GITHUB_TOKEN = os.getenv("REPO_GITHUB_TOKEN")
API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_IDEA = "gemini-1.5-pro-latest"
GEMINI_MODEL_CODE = "gemini-2.5-pro-exp-03-25"
TARGET_REPO_URL = "https://github.com/Raahim2/Online-Desktop"
TARGET_BRANCH = "master"
COMMIT_PATH_PREFIX = "public/projects/BIN/"
HISTORY_FILE_PATH = "PROJECT_HISTORY.json"
MAX_HISTORY_ITEMS_FOR_PROMPT = 25
MAX_STORED_HISTORY_ITEMS = 200
# --- End History Limits Explanation ---


# --- Helper Functions (slugify needs to be robust, others same) ---
def slugify(text):
    """Converts a string to a URL-friendly and filename-safe slug."""
    if not text:
        return "unnamed-project"
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    text = re.sub(r'[-\s]+', '-', text)
    text = text.strip('-')
    if not text:
        return "generated-project"
    return text

def clean_gemini_code_output(raw_code):
    """Removes potential markdown fences and leading/trailing whitespace."""
    if not raw_code: return ""
    cleaned_code = re.sub(r'^```(?:html|HTML)?\s*\n', '', raw_code.strip(), flags=re.IGNORECASE)
    cleaned_code = re.sub(r'\n```\s*$', '', cleaned_code)
    if not cleaned_code.strip().startswith(('<!DOCTYPE', '<html')):
         print("Warning: Cleaned code doesn't start with standard HTML tags. Review output.")
         if cleaned_code.strip().startswith('<'):
              cleaned_code = "<!DOCTYPE html>\n" + cleaned_code
    return cleaned_code.strip()

def get_repo_details(repo_url):
    """Extracts username and repo name from URL."""
    match = re.search(r'github\.com/([^/]+)/([^/]+)', repo_url)
    if not match: return None, None
    username = match.group(1)
    repo_name = match.group(2).replace(".git", "")
    return username, repo_name

def get_github_file_content(token, repo_url, branch, file_path):
    """Fetches content and SHA of a file from GitHub."""
    if not token: print("Error: GitHub token not provided."); return None, None
    username, repo_name = get_repo_details(repo_url)
    if not username: print(f"Error: Invalid GitHub URL: {repo_url}"); return None, None
    api_url = f'https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}'
    headers = { 'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json' }
    try:
        response = requests.get(api_url, headers=headers, params={'ref': branch}, timeout=30)
        response.raise_for_status()
        data = response.json()
        content_encoded = data.get('content')
        sha = data.get('sha')
        if content_encoded and sha:
            content_decoded = base64.b64decode(content_encoded).decode('utf-8')
            print(f"Successfully fetched '{file_path}'. SHA: {sha}")
            return content_decoded, sha
        else: print(f"Warning: Fetched '{file_path}', content/SHA missing."); return None, None
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404: print(f"File '{file_path}' not found."); return None, None
        else: print(f"HTTP Error fetching '{file_path}': {e.response.status_code} {e.response.text}"); return None, None
    except requests.exceptions.RequestException as e: print(f"Network Error fetching '{file_path}': {e}"); return None, None
    except Exception as e: print(f"Unexpected error fetching '{file_path}': {e}"); return None, None

def commit_to_github(token, repo_url, branch, file_path, commit_message, content, current_sha=None):
    """Commits content to GitHub, creating or updating the file."""
    if not token: return {'status': 'failure', 'error': 'GitHub token not provided.'}
    if content is None: return {'status': 'failure', 'error': 'Content is None.'}

    username, repo_name = get_repo_details(repo_url)
    if not username: return {'status': 'failure', 'error': 'Invalid GitHub repository URL'}
    api_url = f'https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}'
    headers = { 'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json' }

    # --- Check for existing file with the SAME path before committing ---
    # This is crucial when using non-UUID filenames to avoid unintentional overwrites
    # if the short ID wasn't enough (though unlikely with the added ID).
    # We still need the SHA for updates, so `get_github_file_content` is appropriate.
    if current_sha is None:
        print(f"SHA not provided for '{file_path}', fetching to check existence and get SHA...")
        _, fetched_sha = get_github_file_content(token, repo_url, branch, file_path)
        if fetched_sha:
             current_sha = fetched_sha
             print(f"File '{file_path}' exists. Found SHA for update: {current_sha}")
        else:
             print(f"File '{file_path}' likely doesn't exist or fetch failed. Proceeding with creation.")
    # --- End check ---

    encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')
    data = { 'message': commit_message, 'content': encoded_content, 'branch': branch }
    if current_sha: data['sha'] = current_sha # Include SHA only if updating

    try:
        put_response = requests.put(api_url, headers=headers, json=data, timeout=60)
        put_response.raise_for_status()
        commit_sha = put_response.json().get('commit', {}).get('sha', 'N/A')
        action = "updated" if current_sha else "created"
        print(f"Successfully {action} '{file_path}'. Commit SHA: {commit_sha}")
        return {'status': 'success', 'details': put_response.json()}
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if e.response.content else str(e)
        print(f"Commit failed for '{file_path}': {e.response.status_code} {error_details}")
        status_code = e.response.status_code
        error_key = 'SHA mismatch (409 Conflict)' if status_code == 409 else \
                    'Unprocessable Entity (422)' if status_code == 422 else \
                    f'HTTP Error {status_code}'
        # Add specific warning for 422 if it might be a filename collision (less likely now)
        if status_code == 422 and 'message' in error_details and 'invalid' in error_details['message'].lower():
             print("Error 422 might indicate an invalid path/filename or other issue.")
        return {'status': 'failure', 'error': f'{error_key}: {error_details}'}
    except requests.exceptions.RequestException as e: print(f"Network error during commit: {e}"); return {'status': 'failure', 'error': f'Network error: {e}'}
    except Exception as e: print(f"Unexpected error during commit: {e}"); return {'status': 'failure', 'error': f'Unexpected error: {e}'}

def gemini(prompt, history=None, gemini_api_key=API_KEY, model="gemini-1.5-pro-latest", temperature=0.7, top_p=1.0):
    """Interacts with Gemini API, supporting conversation history."""
    if not gemini_api_key: print("Error: GEMINI_API_KEY not found."); return None
    contents = []
    if history:
        if isinstance(history, list) and all(isinstance(item, dict) and 'role' in item and 'parts' in item for item in history):
             contents.extend(history)
        else: print("Warning: Invalid history format provided. Ignoring.")
    contents.append({"role": "user", "parts": [{"text": prompt}]})
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": gemini_api_key}
        payload = { "contents": contents, "generationConfig": {"temperature": temperature, "topP": top_p, "maxOutputTokens": 200000} }
        response = requests.post(url, headers=headers, params=params, json=payload, timeout=300)
        response.raise_for_status()
        result = response.json()

        if 'candidates' in result and result['candidates']:
            candidate = result['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content'] and candidate['content']['parts']: return candidate['content']['parts'][0]['text'].strip('" ')
            elif 'finishReason' in candidate and candidate['finishReason'] != 'STOP':
                 print(f"Warning: Gen finished unexpectedly. Reason: {candidate['finishReason']}")
                 if 'safetyRatings' in candidate: print(f"Safety Ratings: {candidate['safetyRatings']}")
                 if 'content' in candidate and 'parts' in candidate['content'] and candidate['content']['parts']: print("Returning potentially partial content."); return candidate['content']['parts'][0]['text'].strip('" ')
                 return None
            else: print("Error: Unexpected response structure (missing content/parts):", result); return None

        elif 'promptFeedback' in result and 'blockReason' in result['promptFeedback']:
             print(f"Error: Prompt blocked. Reason: {result['promptFeedback']['blockReason']}")
             if 'safetyRatings' in result['promptFeedback']: print(f"Safety Ratings: {result['promptFeedback']['safetyRatings']}")
             return None
        else: print("Error: Unexpected API response structure:", result); return None
    except requests.exceptions.Timeout: print(f"Error: API request timed out ({model})."); return None
    except requests.exceptions.RequestException as e:
        print(f"HTTP Request Error: {e}")
        if hasattr(e, 'response') and e.response is not None: print(f"Response: {e.response.status_code} {e.response.text}")
        return None
    except Exception as e: print(f"An unexpected error in gemini function: {e}"); import traceback; traceback.print_exc(); return None

def parse_project_idea_text(full_idea_text):
    """Parses the structured text output, includes raw_output."""
    if not full_idea_text: return None
    project_details = { "name": "Unknown Project Idea", "description": "No description.", "features": [], "raw_output": full_idea_text }
    current_section = None; lines = full_idea_text.strip().split('\n'); feature_lines = []
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped: continue
        if line_stripped.lower().startswith("project name:"): project_details["name"] = line_stripped[len("project name:"):].strip(); current_section = "name"
        elif line_stripped.lower().startswith("description:"): project_details["description"] = line_stripped[len("description:"):].strip(); current_section = "description"
        elif line_stripped.lower().startswith("features:"): current_section = "features"
        elif current_section == "features":
            if line_stripped.startswith(('-', '*')): feature_lines.append(line_stripped[1:].strip())
        elif current_section == "description":
             if not line_stripped.lower().startswith(("project name:", "features:")): project_details["description"] += " " + line_stripped
    project_details["features"] = feature_lines
    if project_details["name"] == "Unknown Project Idea" and project_details["description"] == "No description.":
        print(f"Warning: Could not parse details reliably from text.")
        first_line = next((l.strip() for l in lines if l.strip()), None)
        if first_line: project_details["name"] = first_line
    return project_details

def load_history_from_json(history_content):
    """Loads history from a JSON string, returns a list."""
    if not history_content: return []
    try:
        history_data = json.loads(history_content)
        if isinstance(history_data, list): return history_data
        else: print("Warning: History is not a JSON list."); return []
    except json.JSONDecodeError: print("Warning: Could not decode history JSON."); return []


# --- Main Execution ---
def generate_project():
    # 1. Fetch and Load Project History (JSON)
    print(f"\nFetching project history from '{HISTORY_FILE_PATH}'...")
    history_json_content, history_sha = get_github_file_content(
        token=GITHUB_TOKEN, repo_url=TARGET_REPO_URL, branch=TARGET_BRANCH, file_path=HISTORY_FILE_PATH
    )
    past_projects_data = load_history_from_json(history_json_content)
    print(f"Loaded {len(past_projects_data)} projects from history.")

    # 2. Construct Conversation History for Gemini API
    conversation_history_for_api = []
    if past_projects_data:
        history_to_use = past_projects_data[-MAX_HISTORY_ITEMS_FOR_PROMPT:]
        print(f"Constructing conversation history from last {len(history_to_use)} projects...")
        for project_data in history_to_use:
            conversation_history_for_api.append({ "role": "user", "parts": [{"text": "Give me another unique project idea (HTML, Tailwind, Vanilla JS, no external APIs)."}] })
            model_output_text = project_data.get("raw_output")
            if not model_output_text: 
                features_str = "\n".join([f"- {f}" for f in project_data.get("features", [])])
                model_output_text = (f"Project Name: {project_data.get('name', 'N/A')}\nDescription: {project_data.get('description', 'N/A')}\nFeatures:\n{features_str}").strip()
                print(f"Warning: Reconstructing model output for history: {project_data.get('name', 'N/A')}")
            if model_output_text: conversation_history_for_api.append({ "role": "model", "parts": [{"text": model_output_text}] })
            else:
                 print(f"Warning: Skipping empty history turn for {project_data.get('name', 'N/A')}")
                 if conversation_history_for_api and conversation_history_for_api[-1]["role"] == "user": conversation_history_for_api.pop() # Remove orphan user turn

    # 3. Define the *Current* User Prompt
    idea_generation_prompt = """
    Give me an innovative and easily implementable project idea for a one-page website using only HTML, Tailwind CSS, and vanilla JavaScript.
    The project MUST NOT require any API keys or external services beyond the Tailwind CDN. Ensure the idea is distinct from any previous examples in our conversation.

    **Output Format:**
    Please format the output EXACTLY like this, with each part on a new line:
    Project Name: [A Creative and Unique Project Name]
    Description: [A short, compelling description (1-2 sentences)]
    Features:
    - [Feature 1]
    - [Feature 2]
    - [Feature 3+]
    (List 3-5 key features implementable with HTML/Tailwind/minimal JS)

    **IMPORTANT:** Do NOT include any other text, greetings, explanations, or markdown formatting around this structure. Just provide the Name, Description, and Features as specified.
    """

    # 4. Generate New Idea using Gemini with History
    print("\nGenerating new project idea (using conversation history)...")
    project_idea_text = gemini(
        prompt=idea_generation_prompt, history=conversation_history_for_api,
        model=GEMINI_MODEL_IDEA, temperature=0.95, top_p=0.9
    )
    if not project_idea_text: print("Failed to generate project idea text. Exiting."); return
    print(f"\nGenerated Raw Project Idea Text:\n---\n{project_idea_text}\n---")

    # 5. Parse the *New* Generated Text
    new_project_details = parse_project_idea_text(project_idea_text)
    if not new_project_details: 
        print("Failed to parse project details. Using fallback name.")
        fallback_name = "generated-project-" + str(uuid.uuid4())[:6]
        new_project_details = {"name": fallback_name, "description": "", "features": [], "raw_output": project_idea_text or ""}
    print(f"Parsed New Project Details: {json.dumps(new_project_details, indent=2)}")

    project_name = new_project_details.get('name', 'unnamed-project')
    project_slug = slugify(project_name)
    short_id = str(uuid.uuid4())[:6]
    project_filename = f"{project_slug}-{short_id}.html"
    print(f"Generated Filename: {project_filename}")

    # 6. Generate Code
    code_generation_prompt = f"""
    Generate the complete HTML code for a single-page website based on this specific project idea text:

    {project_idea_text}

    **Strict Requirements:**
    1. Single File Output (.html).
    2. Use HTML & Tailwind CSS 
    3. Clean, polished, intuitive, modern UI/UX using Tailwind utilities (Flexbox, Grid, spacing, typography, colors, effects).
    4. Fully Responsive (mobile, tablet, desktop) using Tailwind modifiers (sm:, md:, lg:).
    5. Well-formatted, readable HTML with semantic tags. Minimal comments.
    6. COMPLETE CODE ONLY: Output ONLY raw HTML from <!DOCTYPE html> to </html>. No explanations, markdown fences, or conversational text.
    7. Output as much code as possible Until all features are totally functional & and the UI is the best.  

    Begin the HTML code now:
    """
    print("\nGenerating HTML code...")
    raw_code = gemini(code_generation_prompt, model=GEMINI_MODEL_CODE, temperature=0.4) # No history needed
    if not raw_code: print("Failed to generate code. Exiting."); return

    # 7. Clean Generated Code
    print("\nCleaning generated code...")
    cleaned_code = clean_gemini_code_output(raw_code)
    if not cleaned_code or not cleaned_code.strip(): print("Cleaned code is empty. Exiting."); return
    print("\nCleaned Code Snippet (first 500 chars):"); print(cleaned_code[:500] + "..."); print("-" * 20)

    project_file_path = f"{COMMIT_PATH_PREFIX.strip('/')}/{project_filename}"
    commit_project_name = new_project_details.get('name', 'Generated Project')
    project_commit_message = f"feat: Add project '{commit_project_name[:50]}...' ({project_filename})" # Include filename in msg

    # 8. Update Project History (JSON) on GitHub
    print(f"\nAttempting to update history file '{HISTORY_FILE_PATH}'...")
    if new_project_details and new_project_details.get("name") != "Unknown Project Idea":
        past_projects_data.append(new_project_details)
    else: print("Warning: Not adding potentially poorly parsed project details to history.")
    if len(past_projects_data) > MAX_STORED_HISTORY_ITEMS:
         print(f"Trimming history from {len(past_projects_data)} to {MAX_STORED_HISTORY_ITEMS} items.")
         past_projects_data = past_projects_data[-MAX_STORED_HISTORY_ITEMS:]
    new_history_json_content = json.dumps(past_projects_data, indent=2)
    history_commit_message = f"chore: Update project history with '{commit_project_name[:50]}...'"
    history_commit_result = commit_to_github(
        token=GITHUB_TOKEN, repo_url=TARGET_REPO_URL, branch=TARGET_BRANCH,
        file_path=HISTORY_FILE_PATH, commit_message=history_commit_message,
        content=new_history_json_content, current_sha=history_sha
    )
    print("\nHistory Commit Result:"); print(history_commit_result)
    if history_commit_result['status'] != 'success':
        print(f"Warning: Failed to update history file '{HISTORY_FILE_PATH}'. Proceeding anyway.")

    time.sleep(2) 

    # 9. Commit Generated Project Code
    print(f"\nAttempting to commit project file: {project_file_path}")
    project_commit_result = commit_to_github(
        token=GITHUB_TOKEN, repo_url=TARGET_REPO_URL, branch=TARGET_BRANCH,
        file_path=project_file_path, commit_message=project_commit_message,
        content=cleaned_code
    )
    print("\nProject Commit Result:"); print(project_commit_result)

    if project_commit_result['status'] == 'success':
        print("\nProcess completed successfully! New project committed and history updated.")
    else:
        print("\nProcess failed during project commit.")


generate_project()