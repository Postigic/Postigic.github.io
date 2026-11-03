import { observeElements, loadSocials } from "./common.js";

function generateSkills(data) {
    const skillsSection = document.querySelector(".skills");
    if (!skillsSection) return;

    skillsSection.innerHTML = "";

    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("skills-container");

    const sortedSkills = data.sort((a, b) => a.name.localeCompare(b.name));

    sortedSkills.forEach((skill) => {
        const skillItem = document.createElement("div");
        skillItem.classList.add("skill-item", "animate-target");

        skillItem.innerHTML = `
            <div class="icon">
                <i class="${skill.icon}" style="color: ${skill.color}"></i>
            </div>
            <p>${skill.name}</p>
        `;

        skillsContainer.appendChild(skillItem);
    });

    skillsSection.appendChild(skillsContainer);

    observeElements({
        elements: document.querySelector(".skills-section"),
        desktopThreshold: 0.5,
    });
}

function loadAchievementsPreview() {
    fetch("data/achievements.json")
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById(
                "achievements-preview-container",
            );
            if (!container) return;

            const selectedAchievements = [
                "Edusave Scholarship",
                "Edusave Award for Achievement, Good Leadership and Service (EAGLES)",
                "Design Thinking with Robotics and Computational Thinking (DrCT) Gold Award",
                "UK Bebras Challenge Gold Award",
                "Singapore Junior Chemistry Olympiad (SJChO) Bronze Award",
                "Singapore Junior Physics Olympiad (SJPO) Honourable Mention Award",
            ];

            container.innerHTML = "";

            const allAchievements = Object.values(data).flat();
            const achievementsToShow = allAchievements.filter((ach) =>
                selectedAchievements.includes(ach.name),
            );

            const uniqueNames = new Set();
            // this is a top tier solution (totally) and i don't care what you say
            const uniqueAchievements = achievementsToShow.filter((ach) => {
                if (uniqueNames.has(ach.name)) return false;
                uniqueNames.add(ach.name);
                return true;
            });

            uniqueAchievements.forEach((ach) => {
                const div = document.createElement("div");
                div.className = "card achievement-preview-card animate-target";

                const img = document.createElement("img");
                img.src = `assets/images/achievements/${ach.image}`;
                img.alt = "";
                img.loading = "lazy";
                img.decoding = "async";
                div.appendChild(img);

                const name = document.createElement("p");
                name.textContent = ach.name;
                div.appendChild(name);

                container.appendChild(div);
            });

            observeElements({
                elements: document.querySelector(".achievements-preview"),
                desktopThreshold: 0.3,
                mobileThreshold: 0.2,
            });
        })
        .catch((error) =>
            console.error("Error loading achievements preview:", error),
        );
}

function loadProjectsPreview() {
    fetch("data/generated/projects.json")
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById(
                "projects-preview-container",
            );
            if (!container) return;

            const selectedProjects = ["Polyrhythm Simulator", "Media To ASCII"];

            container.innerHTML = "";

            const projectsToShow = data.filter((proj) =>
                selectedProjects.includes(proj.name),
            );

            projectsToShow.forEach((proj) => {
                const a = document.createElement("a");
                a.className =
                    "card card--interactive project-preview-card animate-target";
                a.href = proj.link;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.innerHTML = `
                    <h3></h3>
                    <p></p>
                    <img src="assets/images/projects/${proj.image}" alt="" loading="lazy" decoding="async">
                `;
                container.appendChild(a);

                a.querySelector("h3").textContent = proj.name;
                a.querySelector("p").textContent =
                    proj.description || "No description";
            });

            observeElements({
                elements: document.querySelector(".projects-preview"),
                desktopThreshold: 0.5,
            });
        })
        .catch((error) =>
            console.error("Error loading projects preview:", error),
        );
}

function initIndexPage() {
    if (!document.getElementById("index-main-container")) return;

    // setInterval(updateTime, 1000);
    // updateTime();
    // calculateAge();
    fetch("data/skills.json")
        .then((response) => response.json())
        .then((data) => generateSkills(data));

    loadSocials(document.getElementById("hero"));
    loadAchievementsPreview();
    loadProjectsPreview();
    observeElements({ elements: document.querySelector(".about") });
}

initIndexPage();
