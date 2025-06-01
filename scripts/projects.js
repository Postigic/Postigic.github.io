Promise.all([
    fetch("data/projects.json").then((response) => response.json()),
    fetch("data/skills.json").then((response) => response.json()),
])
    .then(([projectsData, skillsData]) => {
        generateProjects(projectsData, skillsData);

        document
            .getElementById("buttonContainer")
            .addEventListener("click", (event) => {
                const button = event.target.closest(".filter-button");
                if (!button) return;

                button.classList.toggle("active");

                const selectedLanguages = Array.from(
                    document.querySelectorAll(
                        "#buttonContainer .filter-button.active"
                    )
                ).map((button) => button.value);

                generateProjects(projectsData, skillsData, selectedLanguages);
            });

        document
            .getElementById("clearFilters")
            .addEventListener("click", () => {
                document
                    .querySelectorAll("#buttonContainer .filter-button.active")
                    .forEach((button) => {
                        button.classList.remove("active");
                    });
                generateProjects(projectsData, skillsData);
            });

        populateLanguageFilter(projectsData, skillsData);
    })
    .catch((error) => {
        console.error("Error fetching projects or skills data:", error);
    });

function observeElements(elements) {
    const observer = new IntersectionObserver(
        (entries, observer) => {
            const visibleEntries = entries.filter(
                (entry) => entry.isIntersecting
            );

            visibleEntries.sort(
                (a, b) =>
                    Array.from(elements).indexOf(a.target) -
                    Array.from(elements).indexOf(b.target)
            );

            visibleEntries.forEach((entry, i) => {
                setTimeout(() => {
                    const project = entry.target;
                    const children = project.querySelectorAll("*");

                    Array.from(children).forEach((child, j) => {
                        child.style.transitionDelay = `${j * 100}ms`;
                        child.classList.add("visible");
                    });

                    project.classList.add("visible");
                    observer.unobserve(project);
                }, i * 150);
            });
        },
        { threshold: 0.8 }
    );

    elements.forEach((el) => observer.observe(el));
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
                            const language = skills["📚 Languages"].find(
                                (skill) => skill.name === languageName
                            );
                            if (language) {
                                const bgColor = darkenColor(
                                    language.color,
                                    0.5
                                );

                                return `
                                    <div class="language-item" style="--lang-color: ${bgColor}">
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

        allProjects = projectsContainer.querySelectorAll(".project");
        observeElements(allProjects);

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
