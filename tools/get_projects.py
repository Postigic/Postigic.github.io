# i don't care anymore i'm not writing in javascript

import json
import requests
import re
from pathlib import Path
from github_utils import fetch_json, format_repo_name, WEBSITE_REPO_ROOT

REPOS = [
    {
        "repo": "Postigic/code-dump-lmao",
        "recursive": True,
        "base_dirs": ["Websites", "Python", "JavaScript", "C", "C++", "Lua"],
    },
    {
        "repo": "Postigic/processor",
        "recursive": False,
    },
    {
        "repo": "Postigic/olympiad-training-sols",
        "recursive": False,
    }
]

IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif"]
LANG_EXT_MAP = {
    ".py": "Python",
    ".js": "JavaScript",
    ".html": "HTML5",
    ".css": "CSS3",
    ".c": "C",
    ".cpp": "C++",
    ".lua": "Lua",
}

EXCLUDE_DIRS = {"header_file_test", "random_or_unmarked"}

ASSETS_DIR = WEBSITE_REPO_ROOT / "assets" / "images" / "project_images"
# ASSETS_DIR = WEBSITE_REPO_ROOT / "test"
OUTPUT_PATH = WEBSITE_REPO_ROOT / "data" / "projects.json"
# OUTPUT_PATH = WEBSITE_REPO_ROOT / "test" / "projects.json"

README_CLEAN_REGEX = re.compile(r"(!?\[.*?\]\(.*?\))|(```.*?```)|(`.*?`)|(\*\*|\*|__|_)")
# behold my incantation (i don't know what this means either)

def get_local_image_path(repo_path: str, ext: str) -> Path:
    return ASSETS_DIR / (Path(repo_path).name + ext)

def upper_all_keywords(title: str) -> str:
    replacements = {
        "Ascii": "ASCII",
        "Youtube": "YouTube",
    } # will add more on demand

    for wrong, right in replacements.items():
        title = title.replace(wrong, right)
    return title

def get_projects_from_github(repo: str, base_dirs: list) -> list:
    projects = []

    for base_dir in base_dirs:
        url = f"https://api.github.com/repos/{repo}/contents/{base_dir}"
        response = fetch_json(url)

        if response:
            for item in response:
                if item["type"] == "dir" and item["name"] not in EXCLUDE_DIRS:
                    full_path = f"{base_dir}/{item['name']}"
                    projects.append({
                        "path": full_path,
                        "name": upper_all_keywords(format_repo_name(item["name"])),
                        "languages": detect_languages(repo, full_path)
                    })
    
    return projects

def detect_languages(repo: str, repo_path: str) -> list:
    url = f"https://api.github.com/repos/{repo}/contents/{repo_path}"
    response = fetch_json(url)
    langs = set()
    
    if response:
        for item in response:
            if item["type"] == "file":
                ext = Path(item["name"]).suffix.lower()
                lang = LANG_EXT_MAP.get(ext)              
                if lang:
                    langs.add(lang)                 
            elif item["type"] == "dir":
                langs.update(detect_languages(repo, f"{repo_path}/{item['name']}"))
    
    return sorted(langs)

# wha... why do i have this function??? just use detect_languages
# i'm such an npc
#
# def get_repo_languages(repo: str) -> list:
#     url = f"https://api.github.com/repos/{repo}/languages"
#     response = fetch_json(url)
#     langs = set()
    
#     if response:
#         for lang in response:
#             mapped = LANG_EXT_MAP.get(f".{lang.lower()}", lang)
#             langs.add(mapped)
    
#     return sorted(langs)

def fetch_text(url: str, timeout: int = 5) -> str | None:
    try:
        response = requests.get(url, headers={"Accept": "text/plain"}, timeout=timeout)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"[ERROR] Failed to fetch {url}: {e}")
        return None
    
def get_project_description(repo: str, repo_path: str) -> str:
    url = f"https://raw.githubusercontent.com/{repo}/main/{repo_path}/README.md"

    try:
        text = fetch_text(url)

        if text:
            for line in text.split("\n"):
                stripped = line.strip()
                if stripped and not stripped.startswith("#"):
                    return README_CLEAN_REGEX.sub("", stripped).strip()
    except Exception as e:
        print(f"Error reading README for {repo_path}: {str(e)}")
    
    return "No description available"

def get_project_image(repo: str, repo_path: str) -> str | None:
    url = f"https://api.github.com/repos/{repo}/contents/{repo_path}/__project_image__"

    try:
        response = fetch_json(url)

        if response:
            for file in response:
                if file["type"] == "file":
                    ext = Path(file["name"]).suffix.lower()
                    
                    if ext in IMAGE_EXTS:
                        image_url = file["download_url"]
                        local_path = get_local_image_path(repo_path, ext)
                        ASSETS_DIR.mkdir(parents=True, exist_ok=True)
                        
                        if not local_path.exists():
                            img_data = requests.get(image_url).content

                            with open(local_path, "wb") as f:
                                f.write(img_data)
                        
                        return local_path.name
    except Exception as e:
        print(f"Error fetching image for {repo_path}: {str(e)}")
    
    return None

def generate_projects_json():
    projects_data = []
    
    for repo in REPOS:
        if repo["recursive"]:
            projects = get_projects_from_github(repo["repo"], repo["base_dirs"])
        else:
            projects = [
                {
                    "path": "",
                    "name": upper_all_keywords(format_repo_name(repo["repo"].split("/")[-1])),
                    "languages": detect_languages(repo["repo"], "")
                }
            ]

        for project in projects:
            projects_data.append({
                "name": project["name"],
                "description": get_project_description(repo["repo"], project["path"]),
                "link": f"https://github.com/{repo['repo']}/tree/main/{project['path']}",
                "languages": project["languages"],
                "image": get_project_image(repo["repo"], project["path"])
            })

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(projects_data, f, indent=4, sort_keys=True)

if __name__ == "__main__":
    generate_projects_json()
