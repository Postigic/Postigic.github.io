function initProjectsPage() {
    if (!document.querySelector(".projects")) return;

    Promise.all([
        fetch("data/projects.json").then((response) => response.json()),
        fetch("data/skills.json").then((response) => response.json()),
    ])
        .then(([projectsData, skillsData]) => {
            // flattening that bloody skills.json broke this section so badly
            // i had an epiphany that i fucking suck at javascript
            // this is why i should stick to python and not web dev
            // what does all this code even do?

            const skillMap = buildSkillMap(skillsData);

            generateProjects(projectsData, skillMap);
            populateProjectsFilter(projectsData, skillMap);
        })
        .catch((error) =>
            console.error("Error fetching projects or skills data:", error),
        );
}

function buildSkillMap(skills) {
    const map = {};
    const icons = {};

    skills.forEach((skill) => {
        map[skill.name] = skill;
        icons[skill.name] = skill.icon;
    });

    return { map, icons };
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

function populateProjectsFilter(projects, skillMap) {
    const buttonContainer = document.getElementById("buttonContainer");
    const languages = new Set();

    const { icons: languageIcons } = skillMap;

    const categoryIcons = {
        Game: "bx bx-joystick",
        Simulation: "bx bx-cog",
        Tool: "bx bx-wrench",
        Algorithm: "bx bx-code-curly",
        Visualiser: "bx bx-bar-chart-alt-2",
        Bot: "bx bx-bot",
        Competitive: "bx bx-trophy",
        Uncategorised: "bx bx-category",
    };

    projects.forEach((project) => {
        project.languages.forEach((language) => {
            languages.add(language);
        });
    });

    buttonContainer.innerHTML = "";

    function createFilterSection(title, values, prefix, iconMap) {
        const filterGroup = document.createElement("div");
        filterGroup.className = "filter-group";

        const sectionTitle = document.createElement("h4");
        sectionTitle.className = "filter-section-title";
        sectionTitle.innerText = title;
        filterGroup.appendChild(sectionTitle);

        const gridContainer = document.createElement("div");
        gridContainer.className = "filter-grid";

        values.forEach((value) => {
            const button = document.createElement("button");
            button.className = "filter-button";
            button.value = value;
            button.id = `filter-${prefix}-${value}`;

            const icon = document.createElement("i");
            icon.className = iconMap[value] || "bx bx-category";
            button.appendChild(icon);

            const text = document.createElement("span");
            text.textContent = value;
            button.appendChild(text);

            gridContainer.appendChild(button);
        });

        filterGroup.appendChild(gridContainer);
        buttonContainer.appendChild(filterGroup);
    }

    createFilterSection(
        "Languages",
        Array.from(languages).sort(),
        "language",
        languageIcons,
    );

    createFilterSection(
        "Categories",
        Object.keys(categoryIcons),
        "category",
        categoryIcons,
    );
}

function generateProjects(
    data,
    skillMap,
    selectedLanguages = [],
    selectedCategories = [],
) {
    const projectsContainer = document.querySelector(".projects");

    const { map: languageMap } = skillMap;

    if (projectsContainer.dataset.generating === "true") return;
    projectsContainer.dataset.generating = "true";

    projectsContainer.innerHTML = "";

    const sortedProjects = data.sort((a, b) => a.name.localeCompare(b.name));

    const filteredProjects = sortedProjects.filter((project) => {
        if (selectedLanguages.length === 0 && selectedCategories.length === 0)
            return true;

        const languageMatch =
            selectedLanguages.length === 0 ||
            selectedLanguages.some((selected) =>
                project.languages?.some((language) => language === selected),
            );

        const categoryMatch =
            selectedCategories.length === 0 ||
            selectedCategories.includes(project.category);

        return languageMatch && categoryMatch;
    });

    const sortedFeaturedProjects = [
        ...filteredProjects.filter((project) => project.featured),
        ...filteredProjects.filter((project) => !project.featured),
    ];

    const projectPromises = sortedFeaturedProjects.map(async (project) => {
        try {
            const imageUrl = await getProjectImage(project.link);
            const projectElement = document.createElement("a");
            projectElement.classList.add("project", "animate-target");
            if (project.featured) projectElement.classList.add("featured");
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
                            const language = languageMap[languageName];
                            if (language) {
                                const bgColor = darkenColor(
                                    language.color,
                                    0.5,
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
                ${project.featured ? '<div class="featured-badge">FEATURED</div>' : ""}
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
        observeElements({ elements: allProjects, desktopThreshold: 0.6 });

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
        defaultImageUrls[Math.floor(Math.random() * defaultImageUrls.length)],
    );
}

function handleClick(event) {
    if (!document.querySelector(".projects")) return;

    const button = event.target.closest(".filter-button");
    if (button) {
        button.classList.toggle("active");

        const activeButtons = document.querySelectorAll(
            "#buttonContainer .filter-button.active",
        );
        const selectedLanguages = [];
        const selectedCategories = [];

        activeButtons.forEach((btn) => {
            if (btn.id.startsWith("filter-language-"))
                selectedLanguages.push(btn.value);
            else if (btn.id.startsWith("filter-category-"))
                selectedCategories.push(btn.value);
        });

        Promise.all([
            fetch("data/projects.json").then((res) => res.json()),
            fetch("data/skills.json").then((res) => res.json()),
        ]).then(([projectsData, skillsData]) => {
            const skillMap = buildSkillMap(skillsData);

            generateProjects(
                projectsData,
                skillMap,
                selectedLanguages,
                selectedCategories,
            );
        });
        return;
    }

    if (event.target.closest("#clearFilters")) {
        document
            .querySelectorAll("#buttonContainer .filter-button.active")
            .forEach((btn) => btn.classList.remove("active"));

        Promise.all([
            fetch("data/projects.json").then((res) => res.json()),
            fetch("data/skills.json").then((res) => res.json()),
        ]).then(([projectsData, skillsData]) => {
            const skillMap = buildSkillMap(skillsData);

            generateProjects(projectsData, skillMap);
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
        return;
    }
}

initProjectsPage();

if (!window.isProjectsListenerAdded) {
    document.addEventListener("click", handleClick);
    window.isProjectsListenerAdded = true;
}
