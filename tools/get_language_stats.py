# the thing using this code was scrapped, but i'm keeping it here because i already
# adapted my existing code to work with it and i don't feel like undoing all that
# cause i'm lazy lol (or well it could be useful for reference but that's an excuse)
#
# import json
# from pathlib import Path
# from collections import defaultdict
# from github_utils import fetch_json, WEBSITE_REPO_ROOT

# USERNAME = "Postigic"
# OUTPUT_PATH = WEBSITE_REPO_ROOT / "data" / "language_stats.json"

# def get_repos(username: str) -> list:
#     repos = []
#     page = 1

#     while True:
#         url = f"https://api.github.com/users/{username}/repos?per_page=100&page={page}"
#         page_data = fetch_json(url)
        
#         if not page_data:
#             break

#         repos.extend([repo["full_name"] for repo in page_data])
       
#         if len(page_data) < 100:
#             break
#         page += 1

#     return repos

# def generate_language_stats_json(): # is this what you call verbose?
#     language_totals = defaultdict(int)
#     repos = get_repos(USERNAME)

#     for repo in repos:
#         url = f"https://api.github.com/repos/{repo}/languages"
#         response = fetch_json(url)

#         if response:
#             for language, count in response.items():
#                 language_totals[language] += count

#         OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
#         with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
#             json.dump(language_totals, f, indent=4, sort_keys=True)

# if __name__ == "__main__":
#     generate_language_stats_json()
