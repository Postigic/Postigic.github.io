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
        return getProjectImage(project.link).then((imageUrl) => {
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
    const repoName = projectLink.split("/").pop();
    const extensions = [".png", ".jpg", ".gif"];

    const defaultImageUrls = [
        "assets/inabakumori-pom-poms.gif",
        "assets/gfl-neural-cloud.gif",
        "assets/inabakumori-rainy-boots.gif",
    ];

    const randomDefaultImageUrl =
        defaultImageUrls[Math.floor(Math.random() * defaultImageUrls.length)];

    const checkImage = (index) => {
        if (index >= extensions.length) {
            console.error(`No image found for ${repoName}`);
            return Promise.resolve(randomDefaultImageUrl);
        }

        const imageUrl = `assets/project_images/${repoName}${extensions[index]}`;
        return fetch(imageUrl).then((response) => {
            if (response.ok) {
                return imageUrl;
            } else {
                return checkImage(index + 1);
            }
        });
    };

    return checkImage(0).catch((error) => {
        console.error("Error fetching project image:", error);
        return randomDefaultImageUrl;
    });
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
