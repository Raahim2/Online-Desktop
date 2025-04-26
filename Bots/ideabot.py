import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_IDEA = "gemini-1.5-pro-latest"
HISTORY_FILE = "idea_history.json"

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return []

def save_history(history):
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

# --- Gemini API Call ---
def gemini(prompt, history=None, gemini_api_key=API_KEY, model="gemini-1.5-pro-latest", temperature=0.7, top_p=1.0):
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY not found.")
        return None

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": gemini_api_key}

        contents = []

        # Add conversation history as assistant messages
        if history:
            for item in history:
                contents.append({"role": "model", "parts": [{"text": item['raw_text']}]})

        # Add the current prompt as a user message
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "topP": top_p,
            }
        }

        response = requests.post(url, headers=headers, params=params, json=payload)
        response.raise_for_status()

        result = response.json()

        if 'candidates' in result and result['candidates']:
            if 'content' in result['candidates'][0] and 'parts' in result['candidates'][0]['content']:
                return result['candidates'][0]['content']['parts'][0]['text'].strip('" ')
            else:
                print("Error: Unexpected response structure (missing content/parts):")
                print(result)
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

# --- MAIN ---

history = load_history()

prompt = (
    "Give me an innovative and easily implementable project idea for a one-page website using only HTML, Tailwind CSS, and vanilla JavaScript. "
    "The AI should output only the project name, a short description, and a clear list of features, without mentioning anything else. "
    "The idea must not require any API keys or external services."
)

idea_text = gemini(prompt, history=history, model=GEMINI_MODEL_IDEA, temperature=0.3, top_p=1.0)

if idea_text:
    print(idea_text)
    idea_lines = idea_text.splitlines()
    project_name = idea_lines[0].replace("**Project Name:**", "").strip() if "**Project Name:**" in idea_lines[0] else "Unknown"
    history.append({"project_name": project_name, "raw_text": idea_text})
    save_history(history)
else:
    print("No idea generated.")
