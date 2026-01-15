fetch("data/skills.json")
    .then((response) => response.json())
    .then((data) => generateSkills(data));

// {
//     const words = ["Student", "Programmer", "STEM Fanatic", "Weeb"];
//     const typewriterElement = document.getElementById("typewriter");
//     let wordIndex = 0;
//     let charIndex = 0;
//     let isDeleting = false;
//     let typingSpeed = 100;

//     function typeEffect() {
//         const currentWord = words[wordIndex];

//         if (!isDeleting) {
//             typewriterElement.textContent = currentWord.substring(
//                 0,
//                 charIndex + 1
//             );
//             charIndex++;
//             if (charIndex === currentWord.length) {
//                 isDeleting = true;
//                 setTimeout(typeEffect, 2500);
//                 return;
//             }
//         } else {
//             typewriterElement.textContent = currentWord.substring(
//                 0,
//                 charIndex - 1
//             );
//             charIndex--;
//             if (charIndex === 0) {
//                 isDeleting = false;
//                 wordIndex = (wordIndex + 1) % words.length;
//             }
//         }

//         setTimeout(typeEffect, isDeleting ? 50 : typingSpeed);
//     }

//     typeEffect();
// } // i don't even know... whatever i give up it just works okay

// function updateTime() {
//     const timeElement = document.getElementById("current-time");

//     if (timeElement) {
//         const currentTime = new Date().toLocaleTimeString([], {
//             timeZone: "Asia/Singapore",
//             hour: "2-digit",
//             minute: "2-digit",
//             hour12: false,
//         });
//         timeElement.innerHTML = `<i class="bx bxs-time-five"></i> ${currentTime}`;
//     }
// }

// function calculateAge() {
//     const birthday = new Date("2009-07-20"); // do you guys like my birthday :)
//     const today = new Date();
//     let age = today.getFullYear() - birthday.getFullYear();
//     const monthDiff = today.getMonth() - birthday.getMonth();

//     if (
//         monthDiff < 0 ||
//         (monthDiff === 0 && today.getDate() < birthday.getDate())
//     ) {
//         age--;
//     }

//     document
//         .querySelectorAll(".age")
//         .forEach((el) => (el.textContent = `${age} years old`));
// }

// function loadSocials() {
//     fetch("data/socials.json")
//         .then((response) => response.json())
//         .then((data) => {
//             const container = document.getElementById("socials-grid");
//             const socialsHTML = data
//                 .map(
//                     ({ url, label, icon, color }) => `
//                         <a class="social-card animate-target" href="${url}"
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             aria-label="${label}"
//                             style="background-color: ${color};">
//                             <i class="${icon}"></i>
//                             <span>${label}</span>
//                         </a>
//                 `
//                 )
//                 .join("");
//             container.innerHTML = socialsHTML;

//             observeElements({ elements: document.querySelector(".socials") });
//             // stuffing this in here fixes a bug so whatever
//         })
//         .catch((error) => console.error("Error loading socials:", error));
// }

function generateSkills(data) {
    const skillsSection = document.querySelector(".skills");

    skillsSection.innerHTML = "";

    for (const category in data) {
        const skillCategory = document.createElement("div");
        skillCategory.classList.add("skill-category", "animate-target");

        skillCategory.innerHTML = `<h2>${category}</h2>`;
        const skillsContainer = document.createElement("div");
        skillsContainer.classList.add("skills-container");

        const sortedSkills = data[category].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        sortedSkills.forEach((skill) => {
            const skillItem = document.createElement("div");
            skillItem.classList.add("skill-item", "animate-target");

            // skillItem.innerHTML = `
            //     <div class="icon">
            //         <i class="${skill.icon}" style="color: ${skill.color}"></i>
            //     </div>
            //     <p>${skill.name}</p>
            //     <div class="chevron-hint"><i class='bx bx-chevron-down'></i></div>
            //     <div class="info">
            //         <p>${skill.description}</p>
            //     </div>
            //     <a href="${skill.documentation}" target="_blank" class="documentation-button">Documentation</a>
            // `;

            skillItem.innerHTML = `
                <div class="icon">
                    <i class="${skill.icon}" style="color: ${skill.color}"></i>
                </div>
                <p>${skill.name}</p>
            `;

            // skillItem
            //     .querySelector(".documentation-button")
            //     .addEventListener("click", (e) => {
            //         e.stopPropagation();
            //     });

            // skillItem.addEventListener("click", function () {
            //     this.classList.toggle("open");
            // });

            skillsContainer.appendChild(skillItem);
        });

        skillCategory.appendChild(skillsContainer);
        skillsSection.appendChild(skillCategory);
    }

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
                "achievements-preview-container"
            );
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

// setInterval(updateTime, 1000);
// updateTime();
// calculateAge();
loadSocials(document.getElementById("hero"));
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
