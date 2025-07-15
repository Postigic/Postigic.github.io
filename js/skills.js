fetch("data/skills.json")
    .then((response) => response.json())
    .then((data) => generateSkills(data));

function generateSkills(data) {
    const skillsSection = document.querySelector(".skills");

    skillsSection.innerHTML = "";

    for (const category in data) {
        const skillCategory = document.createElement("div");
        skillCategory.classList.add("skill-category", "animate-target");

        skillCategory.innerHTML = `<h2>${category}</h2>`;
        const skillsContainer = document.createElement("div");
        skillsContainer.classList.add("skills-container");

        const sortedSkills = data[category].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        sortedSkills.forEach((skill) => {
            const skillItem = document.createElement("div");
            skillItem.classList.add("skill-item", "animate-target");

            skillItem.innerHTML = `
                <div class="icon">
                    <i class="${skill.icon}" style="color: ${skill.color}"></i>
                </div>
                <p>${skill.name}</p>
                <div class="info">
                    <p>${skill.description}</p>
                </div>
                <a href="${skill.documentation}" target="_blank" class="documentation-button">Documentation</a>
                <div class="chevron-hint"><i class='bx bx-chevron-down'></i></div>
            `;

            skillsContainer.appendChild(skillItem);
        });

        skillCategory.appendChild(skillsContainer);
        skillsSection.appendChild(skillCategory);
        observeElements({ elements: skillCategory });
    }
}
