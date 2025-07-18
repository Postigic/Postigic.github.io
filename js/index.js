{
    const words = ["Student", "Programmer", "STEM Fanatic", "Weeb"];
    const typewriterElement = document.getElementById("typewriter");
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        const currentWord = words[wordIndex];

        if (!isDeleting) {
            typewriterElement.textContent = currentWord.substring(
                0,
                charIndex + 1
            );
            charIndex++;
            if (charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(typeEffect, 2500);
                return;
            }
        } else {
            typewriterElement.textContent = currentWord.substring(
                0,
                charIndex - 1
            );
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        setTimeout(typeEffect, isDeleting ? 50 : typingSpeed);
    }

    typeEffect();
} // i don't even know... whatever i give up it just works okay

function updateTime() {
    const timeElement = document.getElementById("current-time");

    if (timeElement) {
        const currentTime = new Date().toLocaleTimeString([], {
            timeZone: "Asia/Singapore",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        timeElement.innerHTML = `<i class="bx bxs-time-five"></i> ${currentTime}`;
    }
}

function calculateAge() {
    const birthday = new Date("2009-07-20"); // do you guys like my birthday :)
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthday.getDate())
    ) {
        age--;
    }

    document
        .querySelectorAll(".age")
        .forEach((el) => (el.textContent = `${age} years old`));
}

function loadSocials() {
    fetch("data/socials.json")
        .then((response) => response.json())
        .then((data) => {
            const container = document.getElementById("contact-grid");
            const socialsHTML = data
                .map(
                    ({ url, label, icon, color }) => `
                        <a class="social-card animate-target" href="${url}" 
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="${label}"
                            style="background-color: ${color};">
                            <i class="${icon}"></i>
                            <span>${label}</span>
                        </a>
                `
                )
                .join("");
            container.innerHTML = socialsHTML;

            observeElements({ elements: document.querySelector(".contacts") });
            // stuffing this in here fixes a bug so whatever
        })
        .catch((error) => console.error("Error loading socials:", error));
}

// there is probably a better way to do this preview thing but honestly i don't care lol
function loadSkillsPreview() {
    fetch("data/skills.json")
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById(
                "skills-preview-container"
            );
            const selectedSkills = ["Python", "JavaScript", "HTML5", "CSS3"];

            container.innerHTML = "";

            const allSkills = Object.values(data).flat();
            const skillsToShow = allSkills.filter((skill) =>
                selectedSkills.includes(skill.name)
            );

            skillsToShow.forEach((skill) => {
                const skillDiv = document.createElement("div");
                skillDiv.className = "skill-preview-item animate-target";

                skillDiv.innerHTML = `
                    <i class="${skill.icon}" style="color: ${skill.color}; font-size: 2rem; margin-bottom: 0.2em;"></i>
                    <p>${skill.name}</p>
                `;

                container.appendChild(skillDiv);
            });

            observeElements({
                elements: document.querySelector(".skills-preview"),
            });
        })
        .catch((error) =>
            console.error("Error loading skills preview:", error)
        );
}

function loadAchievementsPreview() {
    fetch("data/achievements.json")
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById(
                "achievements-preview-container"
            );
            const selectedAchievements = [
                "Edusave Scholarship",
                "Edusave Award for Achievement, Good Leadership and Service (EAGLES)",
                "UK Bebras Challenge Gold Award",
            ];

            container.innerHTML = "";

            const allAchievements = Object.values(data).flat();
            const achievementsToShow = allAchievements.filter((ach) =>
                selectedAchievements.includes(ach.name)
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
                div.className = "achievement-preview-card animate-target";
                div.textContent = ach.name;
                container.appendChild(div);
            });

            observeElements({
                elements: document.querySelector(".achievements-preview"),
            });
        })
        .catch((error) =>
            console.error("Error loading achievements preview:", error)
        );
}

function loadProjectsPreview() {
    fetch("data/projects.json")
        .then((res) => res.json())
        .then((data) => {
            const container = document.getElementById(
                "projects-preview-container"
            );
            const selectedProjects = ["Polyrhythm Simulator", "Circular Pong"];

            container.innerHTML = "";

            const projectsToShow = data.filter((proj) =>
                selectedProjects.includes(proj.name)
            );

            projectsToShow.forEach((proj) => {
                const a = document.createElement("a");
                a.className = "project-preview-card animate-target";
                a.href = proj.link;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.innerHTML = `<h3>${proj.name}</h3>
                <p>${proj.description || "No description"}</p>
                <img src="assets/images/project_images/${proj.image}" alt="${
                    proj.name
                }">`;
                container.appendChild(a);
            });

            observeElements({
                elements: document.querySelector(".projects-preview"),
                desktopThreshold: 0.5,
            });
        })
        .catch((error) =>
            console.error("Error loading projects preview:", error)
        );
}

setInterval(updateTime, 1000);
updateTime();
calculateAge();
loadSocials();
loadSkillsPreview();
loadAchievementsPreview();
loadProjectsPreview();
observeElements({ elements: document.querySelector(".about") });

console.log(
    "%coh, hi! before you go snooping around, i thought you should know that...\n%c\n" +
        "i made this site with:\n- chatg- i mean with REAL human love\n- ten tons of caffeine\n- a stupendous amount of hate for web dev\n\n%c" +
        "thanks for reading, i hope my ai poisoned code doesn't give you an aneurysm or however you spell it :)",
    "color: red; font-size: 2em;",
    "color: inherit;",
    "color: cyan; font-style: italic;"
);
// professional cornball
