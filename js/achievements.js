import { observeElements, getRandomImage } from "./common.js";

let achievements = null;

function initAchievementsPage() {
    fetch("data/achievements.json")
        .then((response) => response.json())
        .then((achievementsData) => {
            achievements = achievementsData;

            generateAchievements(achievementsData);
            populateAchievementsFilter(achievementsData);
        })
        .catch((error) =>
            console.error("Error fetching achievements data:", error),
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

        const sortedTitles = data[year].toSorted((a, b) =>
            a.name.localeCompare(b.name),
        );

        sortedTitles.forEach((achievement) => {
            const achievementCard = document.createElement("div");
            achievementCard.classList.add(
                "card",
                "achievement-card",
                "animate-target",
            );
            achievementCard.setAttribute("data-category", achievement.category);
            achievementCard.setAttribute("data-type", achievement.type);

            achievementCard.classList.add("achievement-card--has-image");

            const achievementImage = document.createElement("img");
            achievementImage.src = achievement.image
                ? `assets/images/achievements/${achievement.image}`
                : getRandomImage(achievement.name);
            achievementImage.alt = "";
            achievementImage.loading = "lazy";
            achievementImage.decoding = "async";
            achievementCard.appendChild(achievementImage);

            const achievementName = document.createElement("div");
            achievementName.classList.add("achievement-name");
            achievementName.textContent = achievement.name;

            const achievementTags = document.createElement("div");
            achievementTags.classList.add("achievement-tags");

            const categoryTag = document.createElement("span");
            categoryTag.classList.add(
                "achievement-tag",
                "achievement-category",
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
        observeElements({
            elements: yearContainer,
            desktopThreshold: 0.2,
            mobileThreshold: 0.05,
        });
    });
}

function populateAchievementsFilter(data) {
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
        Completion: "bx-check-circle",
    };

    Object.values(data)
        .flat()
        .forEach((achievement) => {
            if (achievement.category) categories.add(achievement.category);
            if (achievement.type) types.add(achievement.type);
        });

    const sortedCategories = Array.from(categories).sort((a, b) => {
        if (a === "Miscellaneous") return 1;
        if (b === "Miscellaneous") return -1;
        return a.localeCompare(b);
    });
    const sortedTypes = Array.from(types).sort((a, b) => a.localeCompare(b));

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
            button.setAttribute("aria-pressed", "false");
            button.id = `filter-${prefix}-${value}`;

            // why did i do this??? not that it needs to be fixed but why???
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

    createFilterSection(
        "Category",
        sortedCategories,
        "category",
        categoryIcons,
    );
    createFilterSection("Type", sortedTypes, "type", typeIcons);
}

function handleAchievementsClick(event) {
    const button = event.target.closest(".filter-button");

    if (button) {
        const pressed = button.classList.toggle("active");
        button.setAttribute("aria-pressed", String(pressed));

        const selectedButtons = document.querySelectorAll(
            "#buttonContainer .filter-button.active",
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

        const filteredData = {};

        for (const year in achievements) {
            const filteredAchievements = achievements[year].filter(
                (achievement) => {
                    return (
                        (selectedCategories.length === 0 ||
                            selectedCategories.includes(
                                achievement.category,
                            )) &&
                        (selectedTypes.length === 0 ||
                            selectedTypes.includes(achievement.type))
                    );
                },
            );

            if (filteredAchievements.length > 0) {
                filteredData[year] = filteredAchievements;
            }
        }

        generateAchievements(filteredData);
        return;
    }

    if (event.target.closest("#clearFilters")) {
        if (achievements === null) return;

        document
            .querySelectorAll("#buttonContainer .filter-button.active")
            .forEach((button) => {
                button.classList.remove("active");
                button.setAttribute("aria-pressed", "false");
            });

        generateAchievements(achievements);
        return;
    }

    if (event.target.closest("#toggleFilters")) {
        const filterContainer = document.getElementById("filterContainer");
        const toggleButton = document.getElementById("toggleFilters");
        const icon = toggleButton.querySelector("i");

        const isHidden = filterContainer.classList.contains("hidden");
        filterContainer.classList.toggle("hidden");
        icon.classList.toggle("rotated", isHidden);
        toggleButton.classList.toggle("active", isHidden);
        toggleButton.setAttribute("aria-expanded", String(isHidden));
        return;
    }
}

document.addEventListener("click", handleAchievementsClick);
initAchievementsPage();
