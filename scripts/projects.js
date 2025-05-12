Promise.all([
    fetch("data/projects.json").then((response) => response.json()),
    fetch("data/skills.json").then((response) => response.json()),
])
    .then(([projectsData, skillsData]) => {
        generateProjects(projectsData, skillsData);

        document
            .getElementById("languageFilter")
            .addEventListener("click", () => {
                const selectedLanguages = Array.from(
                    document.querySelectorAll(
                        "#languageFilter .language-button.active"
                    )
                ).map((button) => button.value);

                generateProjects(projectsData, skillsData, selectedLanguages);
            });

        document
            .getElementById("clearFilters")
            .addEventListener("click", () => {
                document
                    .querySelectorAll("#languageFilter .language-button.active")
                    .forEach((button) => {
                        button.classList.remove("active");
                    });
                generateProjects(projectsData, skillsData);
            });

        populateLanguageFilter(projectsData);
    })
    .catch((error) => {
        console.error("Error fetching projects or skills data:", error);
    });

function populateLanguageFilter(projects) {
    const languageFilter = document.getElementById("languageFilter");
    const languages = new Set();

    projects.forEach((project) => {
        project.languages.forEach((language) => {
            languages.add(language);
        });
    });

    languageFilter.innerHTML = "";

    languages.forEach((language) => {
        const container = document.createElement("div");
        container.className = "checkbox-container";

        const button = document.createElement("button");
        button.className = "language-button";
        button.value = language;
        button.id = `filter-${language}`;
        button.innerText = language;

        button.addEventListener("click", function () {
            button.classList.toggle("active");
        });

        container.appendChild(button);
        languageFilter.appendChild(container);
    });
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

    const projectPromises = filteredProjects.map((project) => {
        return getProjectImage(project.link)
            .then((imageUrl) => {
                const projectElement = document.createElement("a");
                projectElement.classList.add("project");
                projectElement.href = project.link;
                projectElement.target = "_blank";
                projectElement.rel = "noopener noreferrer";

                projectElement.innerHTML = `
                <h2>${project.name}</h2>
                <p>${project.description || "No description available"}</p>
                <img src="${
                    project.image
                        ? `assets/project_images/${project.image}`
                        : imageUrl
                }" alt="${project.name}">
                <div class="languages">
                ${
                    project.languages
                        ?.map((languageName) => {
                            const language = skills["📚 Languages"]
                                .concat(skills["🛠️ Tools"])
                                .find((skill) => skill.name === languageName);
                            if (language) {
                                return `
                                    <div class="language-item">
                                        <i class="${language.icon}" style="color: ${language.color}"></i>
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
            })
            .catch((error) => {
                console.error("Error generating project element:", error);
                return null;
            });
    });

    Promise.all(projectPromises).then((projectElements) => {
        projectElements.forEach((projectElement) => {
            if (projectElement) {
                projectsContainer.appendChild(projectElement);
            }
        });

        projectsContainer.dataset.generating = "false";
    });
}

function getProjectImage(project) {
    if (project.image) {
        return Promise.resolve(`assets/project_images/${project.image}`);
    }

    const defaultImageUrls = [
        "assets/inabakumori-pom-poms.gif",
        "assets/gfl-neural-cloud.gif",
        "assets/inabakumori-rainy-boots.gif",
    ];
    return Promise.resolve(
        defaultImageUrls[Math.floor(Math.random() * defaultImageUrls.length)]
    );
}

document.getElementById("toggleFilters").addEventListener("click", () => {
    const filterContainer = document.getElementById("filterContainer");
    const toggleButton = document.getElementById("toggleFilters");

    if (filterContainer.classList.contains("hidden")) {
        filterContainer.classList.remove("hidden");
        toggleButton.innerHTML = "<i class='bx bx-chevron-up'></i>Filters";
    } else {
        filterContainer.classList.add("hidden");
        toggleButton.innerHTML = "<i class='bx bx-chevron-down'></i>Filters";
    }
});
