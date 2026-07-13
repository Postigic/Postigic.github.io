import os
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

WEBSITE_REPO_ROOT = Path(__file__).parent.parent.parent

GITHUB_TOKEN = os.getenv("GH_TOKEN")
SESSION = requests.Session()

if GITHUB_TOKEN:
    SESSION.headers.update({"Authorization": f"token {GITHUB_TOKEN}"})

def fetch_json(url: str, timeout: int = 30) -> dict | None:
    try:
        response = SESSION.get(url, timeout=timeout)
        response.raise_for_status()

        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"[HTTP ERROR] {e} for URL: {url}")
    except Exception as e:
        print(f"[ERROR] Failed to fetch {url}: {e}")
    
    return None

def get_default_branch(repo: str) -> str:
    data = fetch_json(f"https://api.github.com/repos/{repo}")

    # i don't even use branching but just to save future me a headache or two
    return data.get("default_branch", "main") if data else "main"

def fetch_tree(repo: str, branch: str) -> list:
    url = f"https://api.github.com/repos/{repo}/git/trees/{branch}?recursive=1"
    data = fetch_json(url)

    if not data:
        return []
    
    if data.get("truncated"):
        print(f"[WARNING] Tree for {repo} was truncated (repository tree exceeds GitHub API limits)")
    
    return data.get("tree", [])

def format_repo_name(name: str) -> str:
    return name.replace("_", " ").replace("-", " ").title()
