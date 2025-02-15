fetch("data/skills.json")
    .then((response) => response.json())
    .then((data) => generateSkills(data));

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

    if (timeElement) {
        const currentTime = new Date().toLocaleTimeString([], {
            timeZone: "Asia/Singapore",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        timeElement.innerHTML = `<i class="bx bxs-time-five"></i> ${currentTime}`;
    }
}

function calculateAge() {
    const birthday = new Date("2009-07-20"); // do you guys like my birthday :)
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthday.getDate())
    ) {
        age--;
    }

    document.querySelectorAll(".age").forEach((el) => (el.textContent = age));
}

setInterval(updateTime, 1000);
updateTime();
calculateAge();

console.log(
    "%coh, hi! before you go snooping around, i thought you should know that...\n%c\n" +
        "i made this site with:\n- chatg- i mean with REAL human love\n- ten tons of caffeine\n- a stupendous amount of hate for web dev\n\n%c" +
        "thanks for reading, i hope my ai poisoned code doesn't give you an aneurysm or however you spell it :)",
    "color: red; font-size: 2em;",
    "color: inherit;",
    "color: cyan; font-style: italic;"
);
