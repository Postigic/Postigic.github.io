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
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"[HTTP ERROR] {e} for URL: {url}")
    except Exception as e:
        print(f"[ERROR] Failed to fetch {url}: {e}")
    return None

def format_repo_name(name: str) -> str:
    return name.replace("_", " ").replace("-", " ").title()
