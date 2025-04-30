import os
import re
import requests
import base64
import uuid
import time
import json
from dotenv import load_dotenv
import logging

load_dotenv()

# --- Configuration ---
GITHUB_TOKEN = os.getenv("REPO_GITHUB_TOKEN")
API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_IDEA = "gemini-1.5-pro-latest" # Keep pro for better ideas
GEMINI_MODEL_CODE = "gemini-2.5-pro-exp-03-25" # Use pro for potentially better multi-file context handling
TARGET_REPO_URL = "https://github.com/Raahim2/Online-Desktop"
TARGET_BRANCH = "master"
COMMIT_PATH_PREFIX = "public/projects/BIN/" # New prefix for pro projects
HISTORY_FILE_PATH = "PROJECT_HISTORY.json" # Separate history file
MAX_HISTORY_ITEMS_FOR_PROMPT = 15 # Reduce slightly due to potentially larger idea payloads
MAX_STORED_HISTORY_ITEMS = 150
MAX_FILES_PER_PROJECT = 10 # Limit the number of files per project

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Helper Functions ---
def slugify(text):
    """Converts a string to a URL-friendly and filename-safe slug."""
    if not text:
        return "unnamed-project"
    # Remove special characters but keep slashes and dots for paths initially
    text = re.sub(r'[^\w\s\-/.]', '', text).strip().lower()
    # Replace whitespace and multiple hyphens with a single hyphen
    text = re.sub(r'[-\s]+', '-', text)
    # Remove leading/trailing hyphens
    text = text.strip('-')
    # Basic check for common invalid filename chars (might need more OS-specific checks)
    text = re.sub(r'[<>:"|?*]', '', text)
    if not text:
        return "generated-project"
    return text

def clean_gemini_code_output(raw_code, file_type='html'):
    """Removes potential markdown fences and leading/trailing whitespace."""
    if not raw_code: return ""
    # General fence removal
    cleaned_code = re.sub(r'^```[a-zA-Z]*\s*\n', '', raw_code.strip(), flags=re.IGNORECASE)
    cleaned_code = re.sub(r'\n```\s*$', '', cleaned_code)

    # Specific checks based on expected file type
    if file_type == 'html' and not cleaned_code.strip().startswith(('<!DOCTYPE', '<html')):
         logging.warning("Cleaned HTML code doesn't start with standard tags. Adding <!DOCTYPE html>.")
         # Only add doctype if it looks like HTML content is present
         if cleaned_code.strip().startswith('<'):
              cleaned_code = "<!DOCTYPE html>\n" + cleaned_code
         else:
              logging.warning("Content doesn't seem to be HTML, not adding doctype.")

    elif file_type == 'js':
         # Basic check, might need more sophisticated validation
         if not cleaned_code.strip():
             logging.warning("Cleaned JS code is empty.")
         # Could add checks for common JS syntax errors if needed

    elif file_type == 'css':
         # Basic check
         if not cleaned_code.strip():
             logging.warning("Cleaned CSS code is empty.")

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
    if not token: logging.error("GitHub token not provided."); return None, None
    username, repo_name = get_repo_details(repo_url)
    if not username: logging.error(f"Invalid GitHub URL: {repo_url}"); return None, None
    api_url = f'https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}'
    headers = { 'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json' }
    logging.info(f"Attempting to fetch: {api_url} (Branch: {branch})")
    try:
        response = requests.get(api_url, headers=headers, params={'ref': branch}, timeout=45)
        response.raise_for_status()
        data = response.json()
        content_encoded = data.get('content')
        sha = data.get('sha')
        if content_encoded and sha:
            content_decoded = base64.b64decode(content_encoded).decode('utf-8')
            logging.info(f"Successfully fetched '{file_path}'. SHA: {sha}")
            return content_decoded, sha
        else: logging.warning(f"Fetched '{file_path}', but content/SHA missing in response."); return None, None
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404: logging.info(f"File '{file_path}' not found (404)."); return None, None
        else: logging.error(f"HTTP Error fetching '{file_path}': {e.response.status_code} {e.response.text}"); return None, None
    except requests.exceptions.RequestException as e: logging.error(f"Network Error fetching '{file_path}': {e}"); return None, None
    except Exception as e: logging.error(f"Unexpected error fetching '{file_path}': {e}"); return None, None

def commit_to_github(token, repo_url, branch, file_path, commit_message, content, current_sha=None):
    """Commits content to GitHub, creating or updating the file."""
    if not token: return {'status': 'failure', 'error': 'GitHub token not provided.'}
    if content is None: return {'status': 'failure', 'error': 'Content is None.'} # Allow empty string ""

    username, repo_name = get_repo_details(repo_url)
    if not username: return {'status': 'failure', 'error': 'Invalid GitHub repository URL'}
    api_url = f'https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}'
    headers = { 'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json' }

    # Check for existing file *only if* SHA wasn't provided.
    # For multi-file commits, we generally assume creation unless updating history.
    if current_sha is None:
        logging.info(f"SHA not provided for '{file_path}', checking existence...")
        # Use a lighter HEAD request first to just check existence? No, need SHA anyway for updates.
        _, fetched_sha = get_github_file_content(token, repo_url, branch, file_path) # Re-use existing function
        if fetched_sha:
             current_sha = fetched_sha
             logging.info(f"File '{file_path}' exists. Found SHA for update: {current_sha}")
        else:
             logging.info(f"File '{file_path}' doesn't exist or fetch failed. Proceeding with creation.")

    encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')
    data = { 'message': commit_message, 'content': encoded_content, 'branch': branch }
    if current_sha: data['sha'] = current_sha # Include SHA only if updating

    logging.info(f"Attempting to commit to: {api_url} (Action: {'Update' if current_sha else 'Create'})")
    try:
        put_response = requests.put(api_url, headers=headers, json=data, timeout=90) # Increased timeout
        put_response.raise_for_status()
        commit_sha = put_response.json().get('commit', {}).get('sha', 'N/A')
        content_sha = put_response.json().get('content', {}).get('sha', 'N/A')
        action = "updated" if current_sha else "created"
        logging.info(f"Successfully {action} '{file_path}'. Commit SHA: {commit_sha}, Content SHA: {content_sha}")
        return {'status': 'success', 'details': put_response.json(), 'sha': content_sha}
    except requests.exceptions.HTTPError as e:
        error_details_text = "No response body"
        try:
            error_details = e.response.json()
            error_details_text = json.dumps(error_details)
        except json.JSONDecodeError:
            error_details_text = e.response.text

        logging.error(f"Commit failed for '{file_path}': {e.response.status_code} {error_details_text}")
        status_code = e.response.status_code
        error_key = 'SHA mismatch (409 Conflict)' if status_code == 409 else \
                    'Unprocessable Entity (422)' if status_code == 422 else \
                    f'HTTP Error {status_code}'
        if status_code == 422 and 'invalid' in error_details_text.lower():
             logging.warning("Error 422 might indicate an invalid path/filename or other issue.")
        elif status_code == 409:
             logging.warning("Error 409: SHA mismatch. Content may have changed since last fetch.")
        return {'status': 'failure', 'error': f'{error_key}: {error_details_text}', 'status_code': status_code}
    except requests.exceptions.RequestException as e: logging.error(f"Network error during commit: {e}"); return {'status': 'failure', 'error': f'Network error: {e}'}
    except Exception as e: logging.error(f"Unexpected error during commit: {e}"); return {'status': 'failure', 'error': f'Unexpected error: {e}'}

def gemini(prompt, history=None, gemini_api_key=API_KEY, model="gemini-1.5-pro-latest", temperature=0.7, top_p=1.0):
    """Interacts with Gemini API, supporting conversation history."""
    if not gemini_api_key: logging.error("GEMINI_API_KEY not found."); return None
    contents = []
    if history:
        # Basic validation
        if isinstance(history, list) and all(isinstance(item, dict) and 'role' in item and 'parts' in item for item in history):
             contents.extend(history)
        else: logging.warning("Invalid history format provided to gemini function. Ignoring.")

    # Add the current user prompt
    contents.append({"role": "user", "parts": [{"text": prompt}]})

    logging.info(f"Calling Gemini model: {model} | Temp: {temperature} | TopP: {top_p} | History turns: {len(history) if history else 0}")
    # logging.debug(f"Gemini Request Payload (contents only): {json.dumps(contents, indent=2)}")

    max_retries = 2
    for attempt in range(max_retries):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            headers = {"Content-Type": "application/json"}
            params = {"key": gemini_api_key}
            # Increased maxOutputTokens significantly for potentially larger code files
            payload = { "contents": contents, "generationConfig": {"temperature": temperature, "topP": top_p, "maxOutputTokens": 8192} } # Adjust max tokens if needed
            response = requests.post(url, headers=headers, params=params, json=payload, timeout=400) # Increased timeout
            response.raise_for_status()
            result = response.json()
            # logging.debug(f"Gemini Response: {json.dumps(result, indent=2)}")

            if 'candidates' in result and result['candidates']:
                candidate = result['candidates'][0]
                # Check finish reason FIRST
                finish_reason = candidate.get('finishReason')
                if finish_reason != 'STOP' and finish_reason != 'MAX_TOKENS':
                    logging.warning(f"Gemini generation finished unexpectedly. Reason: {finish_reason}")
                    if 'safetyRatings' in candidate: logging.warning(f"Safety Ratings: {candidate.get('safetyRatings')}")
                    # Still try to return content if available, but log the warning
                    if 'content' in candidate and 'parts' in candidate['content'] and candidate['content']['parts']:
                        logging.warning("Returning potentially incomplete content due to non-STOP finish reason.")
                        return candidate['content']['parts'][0]['text'].strip('" ')
                    return None # No content and bad finish reason

                # If finish reason is STOP or MAX_TOKENS, check for content
                if 'content' in candidate and 'parts' in candidate['content'] and candidate['content']['parts']:
                    text_content = candidate['content']['parts'][0]['text'].strip('" ')
                    if finish_reason == 'MAX_TOKENS':
                        logging.warning("Gemini generation stopped due to MAX_TOKENS. Content may be truncated.")
                    return text_content
                else:
                    # This case (finish reason STOP but no content parts) should be rare
                    logging.error(f"Gemini response has finishReason '{finish_reason}' but no content parts. Full candidate: {candidate}")
                    return None # No content even if stopped correctly

            elif 'promptFeedback' in result and 'blockReason' in result['promptFeedback']:
                 block_reason = result['promptFeedback']['blockReason']
                 logging.error(f"Gemini Error: Prompt blocked. Reason: {block_reason}")
                 if 'safetyRatings' in result['promptFeedback']: logging.error(f"Safety Ratings: {result['promptFeedback']['safetyRatings']}")
                 return None # Blocked prompt
            else:
                logging.error(f"Gemini Error: Unexpected API response structure: {result}")
                return None # Unexpected structure

        except requests.exceptions.Timeout:
            logging.warning(f"API request timed out ({model}) on attempt {attempt + 1}/{max_retries}. Retrying if possible...")
            if attempt == max_retries - 1:
                logging.error(f"API request timed out after {max_retries} attempts.")
                return None
            time.sleep(5) # Wait before retry
        except requests.exceptions.RequestException as e:
            logging.error(f"HTTP Request Error calling Gemini: {e}")
            if hasattr(e, 'response') and e.response is not None:
                 logging.error(f"Response: {e.response.status_code} {e.response.text}")
                 # Handle specific errors like 429 Too Many Requests
                 if e.response.status_code == 429:
                     logging.warning(f"Rate limit hit (429). Waiting before retry (attempt {attempt + 1}/{max_retries})...")
                     if attempt == max_retries - 1:
                         logging.error("Rate limit hit, max retries reached.")
                         return None
                     time.sleep(15 + attempt * 5) # Exponential backoff
                     continue # Go to next attempt
                 else:
                     return None # Other HTTP errors are likely fatal for this request
            else:
                return None # Network error without response
        except Exception as e:
            logging.error(f"An unexpected error occurred in gemini function: {e}", exc_info=True)
            return None # Unexpected error
    return None # Should only be reached if all retries fail


def parse_pro_project_idea_text(full_idea_text):
    """Parses the structured text output for BinPro, expecting more detail and a file structure."""
    if not full_idea_text: return None
    project_details = {
        "name": "Unknown Pro Project",
        "description": "No description provided.",
        "features": [],
        "target_audience": "General users",
        "ui_ux_notes": "Standard modern design.",
        "folder_structure": [], # List of relative file paths
        "raw_output": full_idea_text
    }
    current_section = None
    lines = full_idea_text.strip().split('\n')
    temp_features = []
    temp_structure = []

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped: continue

        # Use lower case for matching section headers
        line_lower = line_stripped.lower()

        if line_lower.startswith("project name:"):
            project_details["name"] = line_stripped[len("project name:"):].strip()
            current_section = "name"
        elif line_lower.startswith("description:"):
            project_details["description"] = line_stripped[len("description:"):].strip()
            current_section = "description"
        elif line_lower.startswith("target audience:"):
            project_details["target_audience"] = line_stripped[len("target audience:"):].strip()
            current_section = "audience"
        elif line_lower.startswith("ui/ux considerations:") or line_lower.startswith("ui/ux notes:"):
            project_details["ui_ux_notes"] = line_stripped[len("ui/ux considerations:") if line_lower.startswith("ui/ux considerations:") else len("ui/ux notes:") :].strip()
            current_section = "ui_ux"
        elif line_lower.startswith("key functionalities:") or line_lower.startswith("features:"):
             current_section = "features"
             # Handle case where header and first item are on the same line
             potential_feature = line_stripped[len("key functionalities:") if line_lower.startswith("key functionalities:") else len("features:") :].strip()
             if potential_feature.startswith(('-', '*')):
                 temp_features.append(potential_feature[1:].strip())
        elif line_lower.startswith("suggested folder structure:") or line_lower.startswith("file structure:"):
             current_section = "structure"
             # Handle case where header and first item are on the same line
             potential_file = line_stripped[len("suggested folder structure:") if line_lower.startswith("suggested folder structure:") else len("file structure:") :].strip()
             if potential_file.startswith(('-', '*')):
                 temp_structure.append(potential_file[1:].strip())
        elif current_section == "description":
             if not line_lower.startswith(("project name:", "target audience:", "ui/ux considerations:", "ui/ux notes:", "key functionalities:", "features:", "suggested folder structure:", "file structure:")):
                 project_details["description"] += " " + line_stripped
        elif current_section == "audience":
             if not line_lower.startswith(("project name:", "description:", "ui/ux considerations:", "ui/ux notes:", "key functionalities:", "features:", "suggested folder structure:", "file structure:")):
                 project_details["target_audience"] += " " + line_stripped
        elif current_section == "ui_ux":
             if not line_lower.startswith(("project name:", "description:", "target audience:", "key functionalities:", "features:", "suggested folder structure:", "file structure:")):
                 project_details["ui_ux_notes"] += " " + line_stripped
        elif current_section == "features":
            if line_stripped.startswith(('-', '*')):
                temp_features.append(line_stripped[1:].strip())
        elif current_section == "structure":
            # Expect relative paths like 'index.html', 'js/script.js', 'css/style.css'
            if line_stripped.startswith(('-', '*')):
                file_path = line_stripped[1:].strip()
                # Basic validation: ensure it's not empty and looks like a path
                if file_path and '.' in file_path and not file_path.startswith(('.', '/')):
                    temp_structure.append(file_path)
                else:
                    logging.warning(f"Ignoring potentially invalid file path in structure: '{line_stripped}'")

    project_details["features"] = temp_features
    project_details["folder_structure"] = temp_structure[:MAX_FILES_PER_PROJECT] # Enforce max file limit during parsing

    if not project_details["folder_structure"]:
        logging.warning("Could not parse folder structure. Defaulting to index.html.")
        project_details["folder_structure"] = ["index.html"]
        if project_details["name"] == "Unknown Pro Project": # Also check name if structure fails
             first_line = next((l.strip() for l in lines if l.strip()), None)
             if first_line: project_details["name"] = f"Fallback Project - {first_line[:30]}"
             logging.warning(f"Could not parse project name reliably. Using fallback: {project_details['name']}")

    # Ensure index.html is present if structure was parsed but missing it
    if project_details["folder_structure"] and "index.html" not in project_details["folder_structure"]:
        logging.warning("Parsed structure missing index.html, adding it.")
        project_details["folder_structure"].insert(0, "index.html") # Add to the beginning
        project_details["folder_structure"] = project_details["folder_structure"][:MAX_FILES_PER_PROJECT] # Re-apply limit

    return project_details


def load_history_from_json(history_content):
    """Loads history from a JSON string, returns a list."""
    if not history_content: return []
    try:
        history_data = json.loads(history_content)
        if isinstance(history_data, list): return history_data
        else: logging.warning("History is not a JSON list."); return []
    except json.JSONDecodeError: logging.warning("Could not decode history JSON."); return []
    except Exception as e: logging.error(f"Unexpected error loading history: {e}"); return []


# --- Main Execution ---
def generate_pro_project():
    # 1. Fetch and Load Project History (JSON)
    logging.info(f"\nFetching PRO project history from '{HISTORY_FILE_PATH}'...")
    history_json_content, history_sha = get_github_file_content(
        token=GITHUB_TOKEN, repo_url=TARGET_REPO_URL, branch=TARGET_BRANCH, file_path=HISTORY_FILE_PATH
    )
    past_projects_data = load_history_from_json(history_json_content)
    logging.info(f"Loaded {len(past_projects_data)} projects from PRO history.")

    # 2. Construct Conversation History for *Idea Generation*
    idea_conversation_history = []
    if past_projects_data:
        history_to_use = past_projects_data[-MAX_HISTORY_ITEMS_FOR_PROMPT:]
        logging.info(f"Constructing idea generation history from last {len(history_to_use)} projects...")
        for project_data in history_to_use:
            # Reconstruct a plausible user/model interaction based on stored data
            idea_conversation_history.append({ "role": "user", "parts": [{"text": "Give me another unique multi-file web project idea (HTML, Tailwind, Vanilla JS)."}] }) # Simplified user turn
            model_output_text = project_data.get("raw_output")
            if not model_output_text:
                # Attempt to reconstruct from structured data if raw is missing
                struct_str = "\n".join([f"- {f}" for f in project_data.get('folder_structure', ['index.html'])])
                feat_str = "\n".join([f"- {f}" for f in project_data.get('features', [])])
                model_output_text = (
                    f"Project Name: {project_data.get('name', 'N/A')}\n"
                    f"Description: {project_data.get('description', 'N/A')}\n"
                    f"Target Audience: {project_data.get('target_audience', 'N/A')}\n"
                    f"Key Functionalities:\n{feat_str}\n"
                    f"UI/UX Considerations: {project_data.get('ui_ux_notes', 'N/A')}\n"
                    f"Suggested Folder Structure:\n{struct_str}"
                ).strip()
                logging.warning(f"Reconstructed model output for history: {project_data.get('name', 'N/A')}")

            if model_output_text:
                idea_conversation_history.append({ "role": "model", "parts": [{"text": model_output_text}] })
            else:
                 logging.warning(f"Skipping empty history turn for {project_data.get('name', 'N/A')}")
                 # Clean up dangling user turn if model turn was skipped
                 if idea_conversation_history and idea_conversation_history[-1]["role"] == "user":
                     idea_conversation_history.pop()

    # 3. Define the *Current* User Prompt for Idea Generation
    idea_generation_prompt = f"""
    Generate a creative and detailed project idea for a web application using only HTML, Tailwind CSS (via CDN), and vanilla JavaScript.
    The project should be implementable within {MAX_FILES_PER_PROJECT} files (HTML, JS, potentially CSS if needed beyond Tailwind).
    Ensure the idea is distinct from previous examples in our conversation.

    **Output Format:**
    Please format the output EXACTLY like this, with each section clearly marked:

    Project Name: [A Creative and Unique Project Name]
    Description: [A detailed description (2-4 sentences) explaining the project's purpose and value.]
    Target Audience: [Who is this project for?]
    Key Functionalities:
    - [Detailed Feature 1 - explain what it does]
    - [Detailed Feature 2 - explain what it does]
    - [...] (List 4-7 key features implementable with HTML/Tailwind/JS)
    UI/UX Considerations:
    - [Note on layout, responsiveness, interactivity, or aesthetic]
    - [...] (2-3 points)
    Suggested Folder Structure:
    - index.html
    - js/script.js
    - css/style.css  # Optional: only if custom CSS beyond Tailwind utilities is needed.
    # - assets/icon.svg # Optional: if relevant icons/images are central
    (List the necessary files, max {MAX_FILES_PER_PROJECT}, using relative paths. MUST include index.html)

    **IMPORTANT:** Do NOT include any other text, greetings, explanations, or markdown formatting around this structure. Just provide the structured details as specified.
    """

    # 4. Generate New Idea using Gemini with History
    logging.info("\nGenerating new PRO project idea (using conversation history)...")
    project_idea_text = gemini(
        prompt=idea_generation_prompt, history=idea_conversation_history,
        model=GEMINI_MODEL_IDEA, temperature=0.9, top_p=0.95 # Slightly higher creativity
    )
    if not project_idea_text: logging.error("Failed to generate project idea text. Exiting."); return
    logging.info(f"\nGenerated Raw Project Idea Text:\n---\n{project_idea_text}\n---")

    # 5. Parse the *New* Generated Text
    new_project_details = parse_pro_project_idea_text(project_idea_text)
    if not new_project_details or new_project_details['name'] == "Unknown Pro Project":
        logging.error("Failed to parse project details adequately. Exiting.")
        # Potentially add fallback logic here if desired, but better to fail clearly for now
        return

    logging.info(f"\nParsed New Project Details: {json.dumps(new_project_details, indent=2)}")

    project_name = new_project_details.get('name', 'unnamed-pro-project')
    project_slug = slugify(project_name)
    short_id = str(uuid.uuid4())[:6]
    project_folder_name = f"{project_slug}-{short_id}"
    project_base_path_repo = f"{COMMIT_PATH_PREFIX.strip('/')}/{project_folder_name}" # Path in repo, e.g., public/projects/BINPRO/my-project-abc123

    logging.info(f"Project Folder Name: {project_folder_name}")
    logging.info(f"Base Commit Path in Repo: {project_base_path_repo}")

    # 6. Generate Code for Each File Iteratively with Context
    generated_files = {} # Store generated code: {'relative_path': 'code content'}
    # Start a *new*, temporary history specific to this project's code generation
    code_generation_history = []

    # Add initial context to the code generation history
    initial_context = f"""
    Project Context:
    Name: {project_name}
    Description: {new_project_details['description']}
    Features: {', '.join(new_project_details['features'])}
    Structure: {', '.join(new_project_details['folder_structure'])}
    UI/UX Notes: {', '.join(new_project_details['ui_ux_notes'])}

    We will now generate the code for each file in the structure.
    """
    # Add this context as if the 'model' provided it (or a system prompt if API supports)
    code_generation_history.append({"role": "user", "parts": [{"text": f"Here is the plan for the project '{project_name}'. Let's generate the files."}]})
    code_generation_history.append({"role": "model", "parts": [{"text": initial_context}]})


    files_to_generate = new_project_details.get('folder_structure', [])
    if not files_to_generate:
        logging.error("No file structure defined in the project details. Cannot generate code.")
        return

    logging.info(f"\nStarting code generation for {len(files_to_generate)} files...")

    total_files = len(files_to_generate)
    for i, relative_file_path in enumerate(files_to_generate):
        logging.info(f"--- Generating File {i+1}/{total_files}: {relative_file_path} ---")

        file_type = relative_file_path.split('.')[-1].lower() # Infer file type

        # Construct the prompt for this specific file
        code_gen_prompt = f"""
        Based on the project context provided earlier ({project_name}), generate the complete, production-ready code for the following file:

        **File Path:** `{relative_file_path}`

        **Purpose within project:**
        (Infer the purpose based on the file path and overall project description.
        e.g., For 'index.html': structure, content, Tailwind classes.
        e.g., For 'js/script.js': interactivity, DOM manipulation, event handling.
        e.g., For 'css/style.css': custom styles supplementing Tailwind.)

        **Requirements:**
        1.  Generate ONLY the raw code content for `{relative_file_path}`.
        2.  If HTML: Use semantic tags and Tailwind CSS (via CDN link in `index.html`). Ensure responsiveness. Include a placeholder for JS (`<script src="js/script.js" defer></script>`) if `js/script.js` is in the structure. Include placeholder for CSS (`<link rel="stylesheet" href="css/style.css">`) if `css/style.css` is in the structure. Ensure the main Tailwind CDN link is present in `index.html`.
        3.  If JavaScript: Write clean, efficient vanilla JS. Interact with the HTML structure defined (implicitly or explicitly) in `index.html`. Use `defer` attribute if linked in HTML.
        4.  If CSS: Write standard CSS. This should only contain styles *not easily achievable* with Tailwind utilities.
        5.  NO explanations, comments (unless essential), markdown fences (like ```html), or conversational text.
        6.  Ensure the generated code directly contributes to implementing the project's features and UI/UX notes. Reference the overall project context.

        Generate the code for `{relative_file_path}` now:
        """

        # Add user prompt to temporary history
        # code_generation_history.append({"role": "user", "parts": [{"text": code_gen_prompt}]}) # History included in gemini call

        raw_code = gemini(
            prompt=code_gen_prompt,
            history=code_generation_history, # Pass the accumulating history
            model=GEMINI_MODEL_CODE,
            temperature=0.35, # Lower temp for more predictable code
            top_p=0.98
        )

        if not raw_code:
            logging.error(f"Failed to generate code for {relative_file_path}. Stopping project generation.")
            # Decide whether to commit partial project or stop entirely. Stopping is safer.
            return # Exit the function

        cleaned_code = clean_gemini_code_output(raw_code, file_type)
        generated_files[relative_file_path] = cleaned_code
        logging.info(f"Successfully generated and cleaned code for {relative_file_path}.")
        # logging.debug(f"Cleaned code for {relative_file_path}:\n{cleaned_code[:300]}...")

        # ***IMPORTANT: Update the code generation history***
        # Add the actual user prompt that was sent
        code_generation_history.append({"role": "user", "parts": [{"text": code_gen_prompt}]})
        # Add the model's response (the cleaned code) to the history for context for the *next* file
        code_generation_history.append({"role": "model", "parts": [{"text": cleaned_code}]}) # Use cleaned code for history

        # Optional: Small delay between file generations
        time.sleep(3)

    # 7. Commit Generated Files to GitHub
    logging.info(f"\nCommitting {len(generated_files)} generated files to GitHub...")
    commit_results = {}
    commit_success_count = 0

    # Use a consistent commit message base for all files in this project run
    base_commit_message = f"feat: Add project '{project_name[:40]}' ({project_folder_name})"

    for relative_path, code_content in generated_files.items():
        full_repo_path = f"{project_base_path_repo}/{relative_path}"
        file_commit_message = f"{base_commit_message} - add {relative_path}"
        logging.info(f"Attempting commit for: {full_repo_path}")

        commit_result = commit_to_github(
            token=GITHUB_TOKEN,
            repo_url=TARGET_REPO_URL,
            branch=TARGET_BRANCH,
            file_path=full_repo_path,
            commit_message=file_commit_message,
            content=code_content,
            current_sha=None # Always treat as new file creation within the project folder
        )
        commit_results[full_repo_path] = commit_result
        if commit_result['status'] == 'success':
            commit_success_count += 1
        else:
            logging.error(f"Failed to commit {full_repo_path}: {commit_result.get('error')}")
            # Optional: Implement retry logic here if desired, especially for 409 conflicts if operations overlap somehow

        time.sleep(2) # Small delay between commits

    logging.info(f"\nFile Commit Summary: {commit_success_count}/{len(generated_files)} files committed successfully.")
    # logging.debug(f"Commit Results: {json.dumps(commit_results, indent=2)}")

    if commit_success_count < len(generated_files):
        logging.warning("Some files failed to commit. The project might be incomplete in the repository.")
        # Decide if partial success is acceptable or if history should not be updated.
        # For now, we'll still update history but log the warning.

    # 8. Update Project History (JSON) on GitHub
    logging.info(f"\nAttempting to update PRO history file '{HISTORY_FILE_PATH}'...")
    if new_project_details and new_project_details.get("name") != "Unknown Pro Project":
        # Add the *parsed details* (including structure) to the history
        past_projects_data.append(new_project_details)
    else:
        logging.warning("Not adding poorly parsed project details to history.")

    # Trim history if it exceeds the max stored limit
    if len(past_projects_data) > MAX_STORED_HISTORY_ITEMS:
         logging.info(f"Trimming history from {len(past_projects_data)} to {MAX_STORED_HISTORY_ITEMS} items.")
         past_projects_data = past_projects_data[-MAX_STORED_HISTORY_ITEMS:]

    new_history_json_content = json.dumps(past_projects_data, indent=2)
    history_commit_message = f"chore: Update PRO project history with '{project_name[:50]}...'"

    # Fetch the latest SHA for the history file just before committing
    _, current_history_sha = get_github_file_content(
        token=GITHUB_TOKEN, repo_url=TARGET_REPO_URL, branch=TARGET_BRANCH, file_path=HISTORY_FILE_PATH
    )

    history_commit_result = commit_to_github(
        token=GITHUB_TOKEN, repo_url=TARGET_REPO_URL, branch=TARGET_BRANCH,
        file_path=HISTORY_FILE_PATH, commit_message=history_commit_message,
        content=new_history_json_content, current_sha=current_history_sha # Use latest SHA
    )
    logging.info("\nHistory Commit Result:")
    logging.info(json.dumps(history_commit_result, indent=2))

    if history_commit_result['status'] != 'success':
        logging.error(f"CRITICAL: Failed to update history file '{HISTORY_FILE_PATH}'.")
    else:
        logging.info("Successfully updated history file.")


    # --- Final Summary ---
    print("-" * 50)
    if commit_success_count == len(generated_files) and history_commit_result['status'] == 'success':
        logging.info("✅ BinPro Bot: Process completed successfully!")
        logging.info(f"   Project '{project_name}' ({project_folder_name}) committed with {commit_success_count} files.")
        logging.info(f"   History file '{HISTORY_FILE_PATH}' updated.")
    elif commit_success_count > 0:
        logging.warning("⚠️ BinPro Bot: Process completed with some errors.")
        logging.warning(f"   {commit_success_count}/{len(generated_files)} project files committed.")
        if history_commit_result['status'] != 'success':
            logging.warning(f"   History file update FAILED: {history_commit_result.get('error')}")
        else:
            logging.info("   History file updated successfully.")
    else:
        logging.error("❌ BinPro Bot: Process failed.")
        logging.error("   No project files were successfully committed.")
        if history_commit_result['status'] != 'success':
             logging.error(f"   History file update also FAILED: {history_commit_result.get('error')}")
    print("-" * 50)


# --- Run the Bot ---
if __name__ == "__main__":
    try:
        generate_pro_project()
    except Exception as main_e:
        logging.critical(f"An uncaught exception occurred in main execution: {main_e}", exc_info=True)