Promise.all([fetch("data/awards.json").then((response) => response.json())])
    .then(([awardsData]) => {
        generateAchievements(awardsData);

        document
            .getElementById("buttonContainer")
            .addEventListener("click", (event) => {
                const button = event.target.closest(".filter-button");
                if (!button) return;

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

        document
            .getElementById("clearFilters")
            .addEventListener("click", () => {
                document
                    .querySelectorAll("#buttonContainer .filter-button.active")
                    .forEach((button) => {
                        button.classList.remove("active");
                    });
                generateAchievements(awardsData);
            });

        populateAwardFilter(awardsData);
    })
    .catch((error) => console.error("Error fetching awards data:", error));

function observeElement(element) {
    setTimeout(() => {
        const observer = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");

                        const cards =
                            entry.target.querySelectorAll(".award-card");
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add("visible");
                            }, 150 * index);
                        });

                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );
        observer.observe(element);
    }, 100);
}

function generateAchievements(data) {
    const awardsSection = document.querySelector(".awards");
    awardsSection.innerHTML = "";

    const sortedYears = Object.keys(data).sort((a, b) => b - a);

    sortedYears.forEach((year) => {
        const yearContainer = document.createElement("div");
        yearContainer.classList.add("year-container");

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
            awardCard.classList.add("award-card");
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
        observeElement(yearContainer);
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
        Minor: "bx-star",
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
