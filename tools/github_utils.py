import os
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

WEBSITE_REPO_ROOT = Path(__file__).parent.parent

GITHUB_TOKEN = os.getenv("GH_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

def fetch_json(url, timeout=5):
    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Got status {response.status_code} for URL: {url}")
            return None
    except Exception as e:
        print(f"Error fetching URL {url}: {str(e)}")
        return None

def format_repo_name(name: str) -> str:
    return name.replace("_", " ").replace("-", " ").title()
