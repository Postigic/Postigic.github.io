# i don't care anymore i'm not writing in javascript

import os
import json
import requests
import re
from pathlib import Path

PROJECTS_REPO = "Postigic/code-dump-lmao"
IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif"]
WEBSITE_REPO_ROOT = Path(__file__).parent.parent
ASSETS_DIR = WEBSITE_REPO_ROOT / "assets" / "images" / "project_images"
# ASSETS_DIR = WEBSITE_REPO_ROOT / "test"
EXCLUDE_DIRS = {"header_file_test", "random_or_unmarked"}
GITHUB_TOKEN = os.getenv("GH_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

LANG_EXT_MAP = {
    ".py": "Python",
    ".js": "JavaScript",
    ".html": "HTML5",
    ".css": "CSS3",
    ".c": "C",
    ".cpp": "C++",
    ".lua": "Lua",
}

BASE_DIRS = ["Websites", "Python", "JavaScript", "C", "C++", "Lua"]

def get_projects_from_github():
    projects = []

    for base_dir in BASE_DIRS:
        url = f"https://api.github.com/repos/{PROJECTS_REPO}/contents/{base_dir}"
        response = requests.get(url, headers=HEADERS)

        if response.status_code == 200:
            for item in response.json():
                if item["type"] == "dir" and item["name"] not in EXCLUDE_DIRS:
                    full_path = f"{base_dir}/{item['name']}"
                    projects.append({
                        "path": full_path,
                        "name": item["name"].replace("_", " ").title(),
                        "languages": detect_languages(full_path)
                    })
    return projects

def detect_languages(repo_path):
    url = f"https://api.github.com/repos/{PROJECTS_REPO}/contents/{repo_path}"
    response = requests.get(url, headers=HEADERS)
    langs = set()
    
    if response.status_code == 200:
        for item in response.json():
            if item["type"] == "file":
                ext = Path(item["name"]).suffix.lower()
                lang = LANG_EXT_MAP.get(ext)              
                if lang:
                    langs.add(lang)                 
            elif item["type"] == "dir":
                subdir_path = f"{repo_path}/{item['name']}"
                subdir_langs = detect_languages(subdir_path)
                langs.update(subdir_langs)
    
    return sorted(langs)

def get_project_description(repo_path):
    readme_url = f"https://raw.githubusercontent.com/{PROJECTS_REPO}/main/{repo_path}/README.md"

    try:
        response = requests.get(readme_url, timeout=5)

        if response.status_code == 200:
            for line in response.text.split("\n"):
                stripped = line.strip()
                if stripped and not stripped.startswith("#"):
                    clean = re.sub(r"(!?\[.*?\]\(.*?\))|(```.*?```)|(`.*?`)|(\*\*|\*|__|_)", "", stripped).strip()
                    # behold my incantation (i don't know what this means either)
                    return clean[:200]
    except Exception as e:
        print(f"Error reading README for {repo_path}: {str(e)}")
    return "No description available"

def get_project_image(repo_path):
    url = f"https://api.github.com/repos/{PROJECTS_REPO}/contents/{repo_path}/__project_image__"

    try:
        response = requests.get(url, headers=HEADERS)

        if response.status_code == 200:
            for file in response.json():
                if file["type"] == "file":
                    ext = Path(file["name"]).suffix.lower()
                    
                    if ext in IMAGE_EXTS:
                        image_url = file["download_url"]
                        local_filename = f"{repo_path.split("/").pop()}{ext}"
                        local_path = ASSETS_DIR / local_filename
                        
                        if not local_path.exists():
                            img_data = requests.get(image_url).content

                            with open(local_path, "wb") as f:
                                f.write(img_data)
                        
                        return local_filename
    except Exception as e:
        print(f"Error fetching image for {repo_path}: {str(e)}")
    return None

def generate_projects_json():
    projects_data = []
    all_projects = get_projects_from_github()

    for project in all_projects:
        projects_data.append({
            "name": project["name"],
            "description": get_project_description(project["path"]),
            "link": f"https://github.com/{PROJECTS_REPO}/tree/main/{project['path']}",
            "languages": project["languages"],
            "image": get_project_image(project["path"])
        })

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = WEBSITE_REPO_ROOT / "data" / "projects.json"
    # output_path = WEBSITE_REPO_ROOT / "test" / "projects.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(projects_data, f, indent=4, sort_keys=True)

if __name__ == "__main__":
    generate_projects_json()
