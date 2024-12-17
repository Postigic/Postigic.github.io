fetch("data/projects.json")
    .then((response) => response.json())
    .then((data) => generateProjects(data));

function generateProjects(data) {
    const projectsContainer = document.querySelector(".projects");

    data.forEach((project) => {
        const projectElement = document.createElement("div");
        projectElement.classList.add("project");

        projectElement.innerHTML = `
        <h3><a href="${project.link}" target="_blank">${project.name}</a></h3>
        <p>${project.description}</p>
        <img src="${project.image}" alt="${project.name}">
        <div class="languages">
        ${project.languages
            .map(
                (lang) =>
                    `<div class="language-item">
                        <i class="${lang.icon}" style="color: ${lang.color}"></i>
                        <p>${lang.name}</p>
                    </div>`
            )
            .join("")}
        </div>
      `;

        projectsContainer.appendChild(projectElement);
    });
}
