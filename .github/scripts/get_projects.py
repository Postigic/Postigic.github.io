# i don't care anymore i'm not writing in javascript

import json
import requests
import re
from pathlib import Path
from github_utils import fetch_json, fetch_tree, get_default_branch, format_repo_name, SESSION, WEBSITE_REPO_ROOT

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
    },
    {
        "repo": "Postigic/sorting-algorithm-visualiser",
        "recursive": False,
    },
    {
        "repo": "Postigic/risc-simulator",
        "recursive": False,
    },
    {
        "repo": "Postigic/latex-stuff",
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
    ".tex": "LaTeX",
}

EXCLUDE_DIRS = {"header_file_test", "random_or_unmarked"}

ASSETS_DIR = WEBSITE_REPO_ROOT /"assets"/"images"/"projects"
OUTPUT_PATH = WEBSITE_REPO_ROOT /"data"/"generated"/"projects.json"
META_PATH = WEBSITE_REPO_ROOT /"data"/"projects_meta.json"

README_CLEAN_REGEX = re.compile(r"(!?\[.*?\]\(.*?\))|(```.*?```)|(`.*?`)|(\*\*|\*|__|_)")
# behold my incantation (i don't know what this means either)

def load_project_meta():
    if META_PATH.exists():  
        with open(META_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    
    print(f"[WARNING] No projects_meta.json found at {META_PATH}, skipping metadata")

    return {}

def get_local_image_path(repo: str, repo_path: str, ext: str) -> Path:
    name = Path(repo_path).name or repo.split("/")[-1]

    return ASSETS_DIR / (name + ext)

def upper_all_keywords(title: str) -> str:
    replacements = {
        "Ascii": "ASCII",
        "Youtube": "YouTube",
        "Risc": "RISC",
        "Latex": "LaTeX",
    } # will add more on demand

    for wrong, right in replacements.items():
        title = title.replace(wrong, right)
    return title

def get_projects_from_tree(tree: list, base_dirs: list) -> list:
    projects = []

    for entry in tree:
        if entry["type"] != "tree":
            continue
        
        parts = entry["path"].split("/")
        
        if len(parts) == 2 and parts[0] in base_dirs and parts[1] not in EXCLUDE_DIRS:
            full_path = entry["path"]
            projects.append({
                "path": full_path,
                "name": upper_all_keywords(format_repo_name(parts[1])),
                "languages": detect_languages(tree, full_path)
            })
    
    return projects

def detect_languages(tree: list, repo_path: str) -> list:
    prefix = f"{repo_path}/" if repo_path else ""
    langs = set()

    for entry in tree:
        if entry["type"] == "blob" and entry["path"].startswith(prefix):
            ext = Path(entry["path"]).suffix.lower()
            lang = LANG_EXT_MAP.get(ext)
            if lang:
                langs.add(lang)

    return sorted(langs)

def fetch_text(url: str, timeout: int = 5) -> str | None:
    try:
        response = requests.get(url, headers={"Accept": "text/plain"}, timeout=timeout)
        response.raise_for_status()

        return response.text
    except Exception as e:
        print(f"[ERROR] Failed to fetch {url}: {e}")

        return None
    
def get_project_description(repo: str, branch: str, repo_path: str) -> str:
    url = f"https://raw.githubusercontent.com/{repo}/{branch}/{repo_path}/README.md"

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

def get_project_image(repo: str, branch: str, tree: list, repo_path: str) -> str | None:
    prefix = f"{repo_path}/__project_image__/" if repo_path else "__project_image__/"

    try:
        for entry in tree:
            if entry["type"] != "blob" or not entry["path"].startswith(prefix):
                continue

            ext = Path(entry["path"]).suffix.lower()
            if ext not in IMAGE_EXTS:
                continue

            local_path = get_local_image_path(repo, repo_path, ext)
            ASSETS_DIR.mkdir(parents=True, exist_ok=True)

            if not local_path.exists():
                image_url = f"https://raw.githubusercontent.com/{repo}/{branch}/{entry['path']}"
                img_data = SESSION.get(image_url).content

                with open(local_path, "wb") as f:
                    f.write(img_data)

            return local_path.name
    except Exception as e:
        print(f"Error fetching image for {repo_path}: {str(e)}")

    return None

def generate_projects_json():
    projects_meta = load_project_meta()
    projects_data = []
    
    for repo in REPOS:
        repo_name = repo["repo"]
        branch = get_default_branch(repo_name)
        tree = fetch_tree(repo_name, branch)

        if repo["recursive"]:
            projects = get_projects_from_tree(tree, repo["base_dirs"])
        else:
            projects = [
                {
                    "path": "",
                    "name": upper_all_keywords(format_repo_name(repo_name.split("/")[-1])),
                    "languages": detect_languages(tree, "")
                }
            ]

        for project in projects:
            name = project["name"]

            if name not in projects_meta:
                projects_meta[name] = {
                    "category": None,
                    "featured": False
                }

            project_meta = projects_meta.get(name, {})

            projects_data.append({
                "name": name,
                "description": get_project_description(repo_name, branch, project["path"]),
                "link": f"https://github.com/{repo_name}/tree/{branch}/{project['path']}",
                "languages": project["languages"],
                "image": get_project_image(repo_name, branch, tree, project["path"]),
                "category": project_meta.get("category"),
                "featured": project_meta.get("featured", False)
            })

    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(projects_meta, f, indent=4, sort_keys=True)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(projects_data, f, indent=4, sort_keys=True)

if __name__ == "__main__":
    generate_projects_json()
