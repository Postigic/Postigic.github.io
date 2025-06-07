fetch("data/skills.json")
    .then((response) => response.json())
    .then((data) => generateSkills(data));

function observeElement(element) {
    setTimeout(() => {
        const isMobile = window.innerWidth <= 700;
        const observer = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");

                        const skills =
                            entry.target.querySelectorAll(".skill-item");
                        skills.forEach((skill, index) => {
                            setTimeout(() => {
                                skill.classList.add("visible");
                            }, 150 * index);
                        });

                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: isMobile ? 0.4 : 1.0 }
        );
        observer.observe(element);
    }, 100);
}

function generateSkills(data) {
    const skillsSection = document.querySelector(".skills");

    skillsSection.innerHTML = "";

    for (const category in data) {
        const skillCategory = document.createElement("div");
        skillCategory.classList.add("skill-category");

        skillCategory.innerHTML = `<h2>${category}</h2>`;
        const skillsContainer = document.createElement("div");
        skillsContainer.classList.add("skills-container");

        const sortedSkills = data[category].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        sortedSkills.forEach((skill) => {
            const skillItem = document.createElement("div");
            skillItem.classList.add("skill-item");

            skillItem.innerHTML = `
                <div class="icon">
                    <i class="${skill.icon}" style="color: ${skill.color}"></i>
                </div>
                <p>${skill.name}</p>
                <div class="info">
                    <p>${skill.description}</p>
                </div>
                <a href="${skill.documentation}" target="_blank" class="documentation-button">Documentation</a>
            `;

            skillsContainer.appendChild(skillItem);
        });

        skillCategory.appendChild(skillsContainer);
        skillsSection.appendChild(skillCategory);
        observeElement(skillCategory);
    }
}
