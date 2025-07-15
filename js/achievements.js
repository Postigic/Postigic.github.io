function initAchievementsPage() {
    if (!document.querySelector(".achievements")) return;

    Promise.all([
        fetch("data/achievements.json").then((response) => response.json()),
    ])
        .then(([achievementsData]) => {
            generateAchievements(achievementsData);
            populateAchievementsFilter(achievementsData);
        })
        .catch((error) =>
            console.error("Error fetching achievements data:", error)
        );
}

function generateAchievements(data) {
    const achievementsSection = document.querySelector(".achievements");
    achievementsSection.innerHTML = "";

    const sortedYears = Object.keys(data).sort((a, b) => b - a);

    sortedYears.forEach((year) => {
        const yearContainer = document.createElement("div");
        yearContainer.classList.add("year-container", "animate-target");

        const yearHeader = document.createElement("h2");
        yearHeader.textContent = year;
        yearHeader.classList.add("year-header");
        yearContainer.appendChild(yearHeader);

        const gridContainer = document.createElement("div");
        gridContainer.classList.add("achievements-grid");

        const sortedTitles = data[year]
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));

        sortedTitles.forEach((achievement) => {
            const achievementCard = document.createElement("div");
            achievementCard.classList.add("achievement-card", "animate-target");
            achievementCard.setAttribute("data-category", achievement.category);
            achievementCard.setAttribute("data-type", achievement.type);

            const achievementName = document.createElement("div");
            achievementName.classList.add("achievement-name");
            achievementName.textContent = achievement.name;

            const achievementTags = document.createElement("div");
            achievementTags.classList.add("achievement-tags");

            const categoryTag = document.createElement("span");
            categoryTag.classList.add(
                "achievement-tag",
                "achievement-category"
            );
            categoryTag.textContent = achievement.category;

            const typeTag = document.createElement("span");
            typeTag.classList.add("achievement-tag", "achievement-type");
            typeTag.textContent = achievement.type;

            achievementTags.appendChild(categoryTag);
            achievementTags.appendChild(typeTag);

            achievementCard.appendChild(achievementName);
            achievementCard.appendChild(achievementTags);
            gridContainer.appendChild(achievementCard);
        });

        yearContainer.appendChild(gridContainer);
        achievementsSection.appendChild(yearContainer);
        observeElements({ elements: yearContainer, desktopThreshold: 0.7 });
    });
}

function populateAchievementsFilter(achievements) {
    const buttonContainer = document.getElementById("buttonContainer");
    const categories = new Set();
    const types = new Set();

    const categoryIcons = {
        Competition: "bx-trophy",
        Workshop: "bx-code-alt",
        Olympiad: "bx-medal",
        Academic: "bx-book",
        Miscellaneous: "bx-category",
        CTF: "bx-shield",
    };

    const typeIcons = {
        Award: "bx-award",
        Participation: "bx-user",
        Placement: "bx-list-ol",
    };

    Object.values(achievements)
        .flat()
        .forEach((achievement) => {
            if (achievement.category) categories.add(achievement.category);
            if (achievement.type) types.add(achievement.type);
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
            icon.className = "bx " + (iconMap[value] || "bx-category");
            button.appendChild(icon);

            const text = document.createElement("span");
            text.textContent = value;
            button.appendChild(text);

            gridContainer.appendChild(button);
        });

        filterGroup.appendChild(gridContainer);
        buttonContainer.appendChild(filterGroup);
    }

    createFilterSection("Category", categories, "category", categoryIcons);
    createFilterSection("Type", types, "type", typeIcons);
}

function handleClick(event) {
    if (!document.querySelector(".achievements")) return;

    const button = event.target.closest(".filter-button");
    if (button) {
        button.classList.toggle("active");

        const selectedButtons = document.querySelectorAll(
            "#buttonContainer .filter-button.active"
        );
        const selectedCategories = [];
        const selectedTypes = [];

        selectedButtons.forEach((btn) => {
            if (btn.id.startsWith("filter-category-")) {
                selectedCategories.push(btn.value);
            } else if (btn.id.startsWith("filter-type-")) {
                selectedTypes.push(btn.value);
            }
        });

        fetch("data/achievements.json")
            .then((response) => response.json())
            .then((achievementsData) => {
                const filteredData = {};

                for (const year in achievementsData) {
                    const filteredAchievements = achievementsData[year].filter(
                        (achievement) => {
                            return (
                                (selectedCategories.length === 0 ||
                                    selectedCategories.includes(
                                        achievement.category
                                    )) &&
                                (selectedTypes.length === 0 ||
                                    selectedTypes.includes(achievement.type))
                            );
                        }
                    );

                    if (filteredAchievements.length > 0) {
                        filteredData[year] = filteredAchievements;
                    }
                }

                generateAchievements(filteredData);
            });
        return;
    }

    if (event.target.closest("#clearFilters")) {
        document
            .querySelectorAll("#buttonContainer .filter-button.active")
            .forEach((button) => {
                button.classList.remove("active");
            });

        fetch("data/achievements.json")
            .then((response) => response.json())
            .then(generateAchievements);
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

initAchievementsPage();

if (!window.isAchievementsListenerAdded) {
    document.addEventListener("click", handleClick);
    window.isAchievementsListenerAdded = true;
}
