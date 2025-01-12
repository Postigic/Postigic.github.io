fetch("data/skills.json")
    .then((response) => response.json())
    .then((data) => generateSkills(data));

function generateSkills(data) {
    const skillsSection = document.querySelector(".skills");

    skillsSection.innerHTML = "";

    for (const category in data) {
        const skillCategory = document.createElement("div");
        skillCategory.classList.add("skill-category");

        skillCategory.innerHTML = `<h3>${category}</h3>`;
        const skillsContainer = document.createElement("div");
        skillsContainer.classList.add("skills-container");

        const sortedSkills = data[category].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        sortedSkills.forEach((skill) => {
            const skillItem = document.createElement("a");
            skillItem.classList.add("skill-item");
            skillItem.href = skill.documentation;
            skillItem.target = "_blank";

            skillItem.innerHTML = `
              <div class="icon">
                <i class="${skill.icon}" style="color: ${skill.color}"></i>
              </div>
              <p>${skill.name}</p>
            `;

            skillsContainer.appendChild(skillItem);
        });

        skillCategory.appendChild(skillsContainer);
        skillsSection.appendChild(skillCategory);
    }
}

function updateTime() {
    const timeElement = document.getElementById("current-time");
    const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    timeElement.innerHTML = `<i class="bx bxs-time-five"></i> ${currentTime}`;
}

setInterval(updateTime, 1000);

updateTime();
