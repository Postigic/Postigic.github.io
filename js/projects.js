fetch("data/projects.json")
    .then((response) => response.json())
    .then((data) => {
        generateProjects(data);

        document
            .getElementById("languageFilter")
            .addEventListener("click", () => {
                const selectedLanguages = Array.from(
                    document.querySelectorAll(
                        "#languageFilter .language-button.active"
                    )
                ).map((button) => button.value);

                generateProjects(data, selectedLanguages);
            });

        document
            .getElementById("clearFilters")
            .addEventListener("click", () => {
                document
                    .querySelectorAll("#languageFilter .language-button.active")
                    .forEach((button) => {
                        button.classList.remove("active");
                    });
                generateProjects(data);
            });
    });

fetch("data/skills.json")
    .then((response) => response.json())
    .then((data) => {
        populateLanguageFilter(data);
    });

function populateLanguageFilter(skillsData) {
    const languageFilter = document.getElementById("languageFilter");
    const languages = skillsData.skills["📚 Languages"];

    languages.forEach((language) => {
        const container = document.createElement("div");
        container.className = "checkbox-container";

        const button = document.createElement("button");
        button.className = "language-button";
        button.value = language.name;
        button.id = `filter-${language.name}`;
        button.innerText = language.name;

        button.addEventListener("click", function () {
            button.classList.toggle("active");
        });

        container.appendChild(button);
        languageFilter.appendChild(container);
    });
}

function generateProjects(data, selectedLanguages = []) {
    const projectsContainer = document.querySelector(".projects");

    projectsContainer.innerHTML = "";

    const sortedProjects = data.sort((a, b) => a.name.localeCompare(b.name));

    const filteredProjects = sortedProjects.filter((project) => {
        if (selectedLanguages.length === 0) return true;
        return selectedLanguages.some((selected) =>
            project.languages.some((language) => language.name === selected)
        );
    });

    const projectPromises = filteredProjects.map((project) => {
        return getProjectImage(project.image).then((imageUrl) => {
            const projectElement = document.createElement("div");
            projectElement.classList.add("project");

            projectElement.innerHTML = `
                <h3><a href="${project.link}" target="_blank">${
                project.name
            }</a></h3>
                <p>${project.description}</p>
                <img src="${imageUrl}" alt="${project.name}">
                <div class="languages">
                ${project.languages
                    .map(
                        (language) =>
                            `<div class="language-item">
                                <i class="${language.icon}" style="color: ${language.color}"></i>
                                <p>${language.name}</p>
                            </div>`
                    )
                    .join("")}
                </div>
            `;

            return projectElement;
        });
    });

    Promise.all(projectPromises).then((projectElements) => {
        projectElements.forEach((projectElement) => {
            projectsContainer.appendChild(projectElement);
        });
    });
}

function getProjectImage(projectLink) {
    const readmeUrl = `${projectLink}`;
    const defaultImageUrl = "assets/inabakumori-pom-poms.gif";

    return fetch(readmeUrl)
        .then((response) => response.text())
        .then((data) => {
            const imageUrlMatch = data.match(
                /!\[image\]\((https:\/\/(?:github\.com\/user-attachments\/assets\/[^\)]+|github\.com\/Postigic\/code-dump-lmao\/assets\/[^\)]+))\)/
            );
            if (imageUrlMatch) {
                return imageUrlMatch[1];
            } else {
                console.error(`Image not found for project: ${projectLink}`);
                return defaultImageUrl;
            }
        })
        .catch((error) => {
            console.error("Error fetching README:", error);
            return defaultImageUrl;
        });
}

document.getElementById("toggleFilters").addEventListener("click", () => {
    const filterContainer = document.getElementById("filterContainer");
    const toggleButton = document.getElementById("toggleFilters");
    const body = document.body;

    if (filterContainer.classList.contains("hidden")) {
        filterContainer.classList.remove("hidden");
        toggleButton.innerHTML = "<i class='bx bx-chevron-up'></i>Filters";
    } else {
        filterContainer.classList.add("hidden");
        toggleButton.innerHTML = "<i class='bx bx-chevron-down'></i>Filters";
    }
});
