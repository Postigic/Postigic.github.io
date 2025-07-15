function initProjectsPage() {
    if (!document.querySelector(".projects")) return;

    Promise.all([
        fetch("data/projects.json").then((response) => response.json()),
        fetch("data/skills.json").then((response) => response.json()),
    ])
        .then(([projectsData, skillsData]) => {
            generateProjects(projectsData, skillsData);
            populateLanguageFilter(projectsData, skillsData);
        })
        .catch((error) =>
            console.error("Error fetching projects or skills data:", error)
        );
}
function darkenColor(hex, amount) {
    const col = hex.replace("#", "");
    const num = parseInt(col, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    r = Math.floor(r * (1 - amount));
    g = Math.floor(g * (1 - amount));
    b = Math.floor(b * (1 - amount));

    return `rgb(${r}, ${g}, ${b})`;
}

function populateLanguageFilter(projects, skills) {
    const buttonContainer = document.getElementById("buttonContainer");
    const languages = new Set();

    const languageData = {};
    skills["📚 Languages"].forEach((lang) => {
        languageData[lang.name] = lang;
    });

    projects.forEach((project) => {
        project.languages.forEach((language) => {
            languages.add(language);
        });
    });

    buttonContainer.innerHTML = "";

    const filterGroup = document.createElement("div");
    filterGroup.className = "filter-group";

    const sectionTitle = document.createElement("h4");
    sectionTitle.className = "filter-section-title";
    sectionTitle.innerText = "Languages";
    // whatever man, i'll make it dynamic when i NEED to
    filterGroup.appendChild(sectionTitle);

    const gridContainer = document.createElement("div");
    gridContainer.className = "filter-grid";

    languages.forEach((language) => {
        const button = document.createElement("button");
        button.className = "filter-button";
        button.value = language;
        button.id = `filter-${language}`;

        const data = languageData[language];
        if (data) {
            const icon = document.createElement("i");
            icon.className = data.icon;
            icon.style.color = data.color;
            button.appendChild(icon);
        }

        const text = document.createElement("span");
        text.textContent = language;
        button.appendChild(text);

        gridContainer.appendChild(button);
    });

    filterGroup.appendChild(gridContainer);
    buttonContainer.appendChild(filterGroup);
}

function generateProjects(data, skills, selectedLanguages = []) {
    const projectsContainer = document.querySelector(".projects");

    if (projectsContainer.dataset.generating === "true") return;
    projectsContainer.dataset.generating = "true";

    projectsContainer.innerHTML = "";

    const sortedProjects = data.sort((a, b) => a.name.localeCompare(b.name));

    const filteredProjects = sortedProjects.filter((project) => {
        if (selectedLanguages.length === 0) return true;
        return selectedLanguages.some((selected) =>
            project.languages?.some((language) => language === selected)
        );
    });

    const projectPromises = filteredProjects.map(async (project) => {
        try {
            const imageUrl = await getProjectImage(project.link);
            const projectElement = document.createElement("a");
            projectElement.classList.add("project", "animate-target");
            projectElement.href = project.link;
            projectElement.target = "_blank";
            projectElement.rel = "noopener noreferrer";

            projectElement.innerHTML = `
                <h2 class="animate-target">${project.name}</h2>
                <p class="animate-target">${
                    project.description || "No description available"
                }</p>
                <img class="animate-target" src="${
                    project.image
                        ? `assets/images/project_images/${project.image}`
                        : imageUrl
                }" alt="${project.name}">
                <div class="languages">
                ${
                    project.languages
                        ?.map((languageName) => {
                            const language = skills["📚 Languages"].find(
                                (skill) => skill.name === languageName
                            );
                            if (language) {
                                const bgColor = darkenColor(
                                    language.color,
                                    0.5
                                );

                                return `
                                    <div class="language-item animate-target" style="--lang-color: ${bgColor}">
                                        <i class="${language.icon}" style="color: ${language.color};"></i>
                                        <p>${language.name}</p>
                                    </div>
                                `;
                            }
                            return "";
                        })
                        .join("") || "No languages available"
                }
                </div>
            `;
            return projectElement;
        } catch (error) {
            console.error("Error generating project element:", error);
            return null;
        }
    });

    Promise.all(projectPromises).then((projectElements) => {
        projectElements.forEach((projectElement) => {
            if (projectElement) {
                projectsContainer.appendChild(projectElement);
            }
        });

        allProjects = projectsContainer.querySelectorAll(".project");
        observeElements({ elements: allProjects, desktopThreshold: 0.8 });

        projectsContainer.dataset.generating = "false";
    });
}

function getProjectImage(project) {
    if (project.image) {
        return Promise.resolve(`assets/project_images/${project.image}`);
    }

    const defaultImageUrls = [
        "assets/images/neuro_abs_cinema.jpg",
        "assets/images/gfl-neural-cloud.webp",
        "assets/images/inabakumori-rainy-boots.gif",
    ];
    return Promise.resolve(
        defaultImageUrls[Math.floor(Math.random() * defaultImageUrls.length)]
    );
}

function handleClick(event) {
    if (!document.querySelector(".projects")) return;

    const button = event.target.closest(".filter-button");
    if (button) {
        button.classList.toggle("active");

        const selectedLanguages = Array.from(
            document.querySelectorAll("#buttonContainer .filter-button.active")
        ).map((button) => button.value);

        Promise.all([
            fetch("data/projects.json").then((res) => res.json()),
            fetch("data/skills.json").then((res) => res.json()),
        ]).then(([projectsData, skillsData]) => {
            generateProjects(projectsData, skillsData, selectedLanguages);
        });
        return;
    }

    if (event.target.closest("#clearFilters")) {
        document
            .querySelectorAll("#buttonContainer .filter-button.active")
            .forEach((button) => {
                button.classList.remove("active");
            });

        Promise.all([
            fetch("data/projects.json").then((res) => res.json()),
            fetch("data/skills.json").then((res) => res.json()),
        ]).then(([projectsData, skillsData]) => {
            generateProjects(projectsData, skillsData);
        });
        return;
    }

    if (event.target.closest("#toggleFilters")) {
        const filterContainer = document.getElementById("filterContainer");
        const toggleButton = document.getElementById("toggleFilters");
        const icon = toggleButton.querySelector("i");

        const isHidden = filterContainer.classList.contains("hidden");
        filterContainer.classList.toggle("hidden");

        icon.classList.toggle("rotated", isHidden);
        console.log("toggleFilters clicked " + isHidden);
        return;
    }
}

initProjectsPage();

if (!window.isProjectsListenerAdded) {
    document.addEventListener("click", handleClick);
    window.isProjectsListenerAdded = true;
}
