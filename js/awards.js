function initAwardsPage() {
    if (document.querySelector(".awards") === null) return;

    Promise.all([fetch("data/awards.json").then((response) => response.json())])
        .then(([awardsData]) => {
            generateAchievements(awardsData);
            populateAwardFilter(awardsData);
        })
        .catch((error) => console.error("Error fetching awards data:", error));
}

function generateAchievements(data) {
    const awardsSection = document.querySelector(".awards");
    awardsSection.innerHTML = "";

    const sortedYears = Object.keys(data).sort((a, b) => b - a);

    sortedYears.forEach((year) => {
        const yearContainer = document.createElement("div");
        yearContainer.classList.add("year-container", "animate-target");

        const yearHeader = document.createElement("h2");
        yearHeader.textContent = year;
        yearHeader.classList.add("year-header");
        yearContainer.appendChild(yearHeader);

        const gridContainer = document.createElement("div");
        gridContainer.classList.add("awards-grid");

        const sortedTitles = data[year]
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));

        sortedTitles.forEach((award) => {
            const awardCard = document.createElement("div");
            awardCard.classList.add("award-card", "animate-target");
            awardCard.setAttribute("data-category", award.category);
            awardCard.setAttribute("data-type", award.type);

            const awardName = document.createElement("div");
            awardName.classList.add("award-name");
            awardName.textContent = award.name;

            const awardTags = document.createElement("div");
            awardTags.classList.add("award-tags");

            const categoryTag = document.createElement("span");
            categoryTag.classList.add("award-tag", "award-category");
            categoryTag.textContent = award.category;

            const typeTag = document.createElement("span");
            typeTag.classList.add("award-tag", "award-type");
            typeTag.textContent = award.type;

            awardTags.appendChild(categoryTag);
            awardTags.appendChild(typeTag);

            awardCard.appendChild(awardName);
            awardCard.appendChild(awardTags);
            gridContainer.appendChild(awardCard);
        });

        yearContainer.appendChild(gridContainer);
        awardsSection.appendChild(yearContainer);
        observeElements({ elements: yearContainer, desktopThreshold: 0.7 });
    });
}

function populateAwardFilter(awards) {
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

    Object.values(awards)
        .flat()
        .forEach((award) => {
            if (award.category) categories.add(award.category);
            if (award.type) types.add(award.type);
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

document.addEventListener("click", (event) => {
    if (!document.querySelector(".awards")) return;

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

        fetch("data/awards.json")
            .then((response) => response.json())
            .then((awardsData) => {
                const filteredData = {};

                for (const year in awardsData) {
                    const filteredAwards = awardsData[year].filter((award) => {
                        return (
                            (selectedCategories.length === 0 ||
                                selectedCategories.includes(award.category)) &&
                            (selectedTypes.length === 0 ||
                                selectedTypes.includes(award.type))
                        );
                    });

                    if (filteredAwards.length > 0) {
                        filteredData[year] = filteredAwards;
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

        fetch("data/awards.json")
            .then((response) => response.json())
            .then(generateAchievements);
        return;
    }

    if (event.target.closest("#toggleFilters")) {
        const filterContainer = document.getElementById("filterContainer");
        const toggleButton = document.getElementById("toggleFilters");
        const icon = toggleButton.querySelector("i");

        if (filterContainer.classList.contains("hidden")) {
            filterContainer.classList.remove("hidden");
            icon.className = "bx bx-chevron-up";
        } else {
            filterContainer.classList.add("hidden");
            icon.className = "bx bx-chevron-down";
        }
        return;
    }
});

document.addEventListener("turbo:load", initAwardsPage);
if (document.querySelector(".awards")) initAwardsPage();
