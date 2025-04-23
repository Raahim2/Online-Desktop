import os
import re
import requests
import base64
import random
import uuid

GITHUB_TOKEN = os.getenv("REPO_GITHUB_TOKEN")
API_KEY = os.getenv("GEMINI_API_KEY")


def slugify(text):
    """Converts a string to a URL-friendly slug."""
    return re.sub(r'[^a-zA-Z0-9]+', '-', text).strip('-').lower()

def commit_to_github(token, repo_url, file_path, commit_message, content, isAppend=False, isTruncate=True):
    match = re.search(r'github\.com/([^/]+)/([^/]+)', repo_url)
    if not match:
        return {'status': 'failure', 'error': 'Invalid GitHub repository URL'}

    username = match.group(1)
    repo_name = match.group(2).replace(".git","")

    api_url = f'https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}'

    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    response = requests.get(api_url, headers=headers)
    if response.status_code == 200:
        file_data = response.json()
        sha = file_data.get('sha')
        existing_content = base64.b64decode(file_data['content']).decode()
        
        if isAppend:
            updated_content = existing_content + "\n" + content
        else:
            updated_content = content
    else:
        sha = None
        updated_content = content  

    if isTruncate and updated_content.strip() != "":
        lines = updated_content.splitlines()
        if len(lines) > 2:
            updated_content = "\n".join(lines[1:-1])
        else:
            updated_content = ""

    encoded_content = base64.b64encode(updated_content.encode()).decode()

    data = {
        'message': commit_message,
        'content': encoded_content,
        'sha': sha  
    }

    res = requests.put(api_url, headers=headers, json=data)

    if res.status_code in [200, 201]:
        print("Successful commit")
        return {'status': 'success', 'details': res.json()}
    else:
        return {'status': 'failure', 'error': res.json()}


def gemini(prompt, gemini_api_key=API_KEY , model="gemini-2.5-pro-exp-03-25"):
    """
    Function to interact with the Gemini API using the provided prompt.
    """
    # gemini-1.5-flash
    try:
        # Gemini API request
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "key": gemini_api_key
        }
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ]
        }

        response = requests.post(url, headers=headers, params=params, json=payload)

        if response.status_code == 200:
            result = response.json()
            return result['candidates'][0]['content']['parts'][0]['text']
        else:
            print(response.text)  # Debug info
            return None

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

prompts = [
    "Give me a creative and unique project idea for a website using HTML and Tailwind CSS. Output only the idea.",
    "Suggest one new web project I could build using HTML and Tailwind CSS. Output only the idea.",
    "Generate a fresh and interesting HTML + Tailwind CSS project idea. Output only the name or title.",
    "What's an original beginner-friendly HTML + Tailwind CSS project idea? Output only the idea.",
    "Give a fun and useful project idea I can build with only HTML and Tailwind CSS. Output only the title.",
    "Suggest an innovative web UI concept that can be built using HTML and Tailwind CSS. Output only the idea.",
    "Propose a mini-project idea using HTML and Tailwind CSS that involves interactive UI. Output only the idea.",
    "Name a unique concept for a responsive website using HTML and Tailwind CSS. Output only the idea.",
    "What’s a cool static web project idea using Tailwind CSS and HTML? Output just the project title.",
    "Give me one creative, small-scale portfolio project idea using HTML and Tailwind CSS. Output only the idea.",
    "Suggest a fun clone project idea using Tailwind CSS and HTML only (like a simplified app or tool). Output only the project idea.",
    "What’s a lesser-known but interesting web layout idea I can make with HTML and Tailwind CSS? Output only the idea.",
    "Propose a themed landing page concept that can be done in HTML and Tailwind CSS. Output only the idea.",
    "Generate one random and visually appealing project idea using only Tailwind CSS and HTML. Output only the project idea title.",
    "Give a creative challenge project idea that pushes Tailwind CSS layout skills using just HTML and Tailwind. Output only the idea."
]


project_prompt = random.choice(prompts)
unique_id = uuid.uuid4()

project_idea = gemini(project_prompt , model="gemini-1.5-flash")
print(project_idea)
prompt = gemini(f"give prompt to make a project for {project_idea} html and tailiwnd css , make the prompt in a way that the bot will only output the code in just one html file and the bot output just the code nothing else also the bot should focus more on UI and UX and the code should be clean and well structured and the code should be responsive and the code should be in one file only" , model="gemini-1.5-flash")
print(prompt)
code = gemini(prompt)
print(code)
res = commit_to_github(GITHUB_TOKEN, "https://github.com/Raahim2/Online-Desktop" , f"public/projects/BIN/{unique_id}.html", "added bin project", code, isAppend=False, isTruncate=True)
print(res)


