import os
import re
import requests
import base64
import random
import uuid
from dotenv import load_dotenv
load_dotenv()

# --- Configuration ---
GITHUB_TOKEN = os.getenv("REPO_GITHUB_TOKEN")
API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_IDEA = "gemini-1.5-pro-latest" # Model for generating the idea
GEMINI_MODEL_CODE = "gemini-2.5-pro-exp-03-25" # Model for generating the code
TARGET_REPO_URL = "https://github.com/Raahim2/Online-Desktop" # Your repo URL
TARGET_BRANCH = "master" # Or your specific branch
COMMIT_PATH_PREFIX = "public/projects/BIN/" # Path within the repo

# --- NEW: List of diverse themes to inject randomness ---
IDEA_THEMES = [
    "dashboards and data visualization", "Simple projects for Begenners", "tools for developers",
    "science fiction concepts", "nature and biology",
    "retro computing interfaces", "food and recipe visualization", "abstract art generation",
    "AI", "obscure historical events",
    "English Literature", "celestial bodies and space", "mythology and folklore",
    "urban exploration themes", "optical illusions", "sound visualization",
    "educational micro-interactions", "UI/UX", "cyberpunk city elements",
    "generative patterns", "interactive storytelling snippets"
]

# --- Helper Functions (Keep slugify, clean_gemini_code_output, commit_to_github, gemini as before) ---

def slugify(text):
    """Converts a string to a URL-friendly slug."""
    # Keep it simple for filenames if needed, though UUID is used here
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    text = re.sub(r'[-\s]+', '-', text)
    return text

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


def gemini(prompt, gemini_api_key=API_KEY, model="gemini-1.5-pro-latest", temperature=0.7, top_p=1.0):
    """
    Function to interact with the Gemini API.
    """
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY not found.")
        return None

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": gemini_api_key}
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": { # Use generationConfig for these parameters
                "temperature": temperature,
                "topP": top_p,
            }
            # Optional: Adjust safety settings if needed
            # "safetySettings": [ ... ]
        }

        response = requests.post(url, headers=headers, params=params, json=payload)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        result = response.json()

        # Check for successful response structure
        if 'candidates' in result and result['candidates']:
            if 'content' in result['candidates'][0] and 'parts' in result['candidates'][0]['content']:
                 # Strip potential leading/trailing quotes sometimes added by models
                 return result['candidates'][0]['content']['parts'][0]['text'].strip('" ')
            elif 'finishReason' in result['candidates'][0] and result['candidates'][0]['finishReason'] != 'STOP':
                 print(f"Warning: Generation finished unexpectedly. Reason: {result['candidates'][0]['finishReason']}")
                 if 'safetyRatings' in result['candidates'][0]:
                     print(f"Safety Ratings: {result['candidates'][0]['safetyRatings']}")
                 return None # Indicate potential issue
            else:
                 print("Error: Unexpected response structure (missing content/parts):")
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


# --- Main Execution ---

# 1. Generate a Unique Project Idea
print("Generating project idea...")
random_theme = random.choice(IDEA_THEMES)
print(f"Injecting random theme: '{random_theme}'")

# **MODIFIED** idea generation prompt
idea_generation_prompt = (
    f"Generate ONE highly creative, unique, and uncommon project idea suitable for a SINGLE HTML file using only Tailwind CSS. "
    f"The idea should strongly relate to the theme of: '{random_theme}'. "
    "Focus on ideas that allow for interesting UI/UX elements or visualizations. "
    "Think outside the box - be imaginative and specific! "
    "AVOID common examples like: simple portfolio, blog, basic calculator, to-do list, weather app, clock, login form, generic landing page. "
    "Output ONLY the project idea name or a very short description (max 15 words). Do not add quotes around the output."
)

# **MODIFIED** Use higher temperature for more variance in idea generation
project_idea = gemini(
    idea_generation_prompt,
    model=GEMINI_MODEL_IDEA,
    temperature=0.95, # Increased temperature
    top_p=0.9 # Adjust top_p slightly if needed, often good with high temp
)

if not project_idea:
    print("Failed to generate a project idea. Exiting.")
    exit()

# Clean up potential leading/trailing spaces or quotes just in case
project_idea = project_idea.strip().strip('"')

print(f"Generated Project Idea: {project_idea}")

# 2. Construct the Detailed Code Generation Prompt (Keep this prompt structure as it's very specific)
code_generation_prompt = f"""
Generate the complete HTML code for a single-page website based on this specific project idea: '{project_idea}'.

**Strict Requirements:**

1.  **Single File Output:** The entire code MUST be contained within a single HTML file (`.html`).
2.  **HTML & Tailwind CSS Only:** Use only standard HTML5 and Tailwind CSS for ALL styling. Include Tailwind via its CDN script: `<script src="https://cdn.tailwindcss.com"></script>` within the `<head>`. Do NOT use external CSS files or `<style>` blocks unless absolutely necessary for very specific, minor tweaks not achievable with Tailwind classes.
3.  **UI/UX Focus:** Prioritize a clean, visually appealing, and intuitive user interface and user experience. Make it look polished and modern. Use appropriate Tailwind utilities for layout (Flexbox, Grid), spacing, typography, colors, and effects. Implement the core concept of '{project_idea}'.
4.  **Responsiveness:** The layout MUST be fully responsive and adapt gracefully to different screen sizes (mobile, tablet, desktop). Use Tailwind's responsive modifiers (e.g., `sm:`, `md:`, `lg:`).
5.  **Clean & Structured Code:** Write well-formatted, readable HTML with semantic tags where appropriate (e.g., `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`). Use comments sparingly only where needed for clarification.
6.  **Placeholder Content:** Include relevant placeholder text and potentially images using placeholder services (like `https://via.placeholder.com/400x300` or similar). Ensure placeholders fit the design and the theme '{project_idea}'.
7.  **Interactivity (Optional but Encouraged):** If the project idea suggests interactivity, implement it using minimal inline JavaScript within HTML attributes (`onclick="..."`) or a small `<script>` tag at the end of the `<body>`. AVOID complex JavaScript logic; focus on the HTML/CSS structure. If JS is added, ensure it's simple and enhances the UI/UX based on '{project_idea}'.
8.  **COMPLETE CODE ONLY:** Output ONLY the raw, complete HTML code starting from `<!DOCTYPE html>` and ending with `</html>`. Do NOT include:
    *   Any explanations before or after the code.
    *   Any descriptive text about the code.
    *   Markdown formatting like ```html ... ``` surrounding the code block.
    *   Any conversational text.

**Project Idea to Implement:** {project_idea}

Begin the HTML code now:
"""

print("\nGenerating HTML code based on the idea...")
# Keep temperature moderate for code generation to avoid overly 'creative' (broken) code
raw_code = gemini(code_generation_prompt, model=GEMINI_MODEL_CODE, temperature=0.5)

if not raw_code:
    print("Failed to generate the code. Exiting.")
    exit()

# 3. Clean the Generated Code
print("\nCleaning generated code...")
cleaned_code = clean_gemini_code_output(raw_code)

if not cleaned_code:
     print("Code cleaning resulted in empty content. Cannot commit. Exiting.")
     exit()

# Optional: Print first few lines of cleaned code for verification
print("\nCleaned Code Snippet (first 500 chars):")
print(cleaned_code[:500] + "...")
print("-" * 20)


# 4. Commit to GitHub
unique_id = uuid.uuid4()
file_path = f"{COMMIT_PATH_PREFIX.strip('/')}/{unique_id}.html" # Ensure no double slashes
# Make commit message slightly more descriptive including the theme might help track variety
commit_message = f"feat: Add unique project '{project_idea[:40]}...' ({random_theme}) ({unique_id})"


print(f"\nAttempting to commit to: {TARGET_REPO_URL}")
print(f"File path: {file_path}")
print(f"Branch: {TARGET_BRANCH}")
print(f"Commit message: {commit_message}")

commit_result = commit_to_github(
    token=GITHUB_TOKEN,
    repo_url=TARGET_REPO_URL,
    branch=TARGET_BRANCH,
    file_path=file_path,
    commit_message=commit_message,
    content=cleaned_code
)

print("\nCommit Result:")
print(commit_result)

if commit_result['status'] == 'success':
    print("\nProcess completed successfully!")
else:
    print("\nProcess failed during commit.")