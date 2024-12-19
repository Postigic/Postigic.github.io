fetch("data/projects.json")
    .then((response) => response.json())
    .then((data) => generateProjects(data));

function generateProjects(data) {
    const projectsContainer = document.querySelector(".projects");

    const sortedProjects = data.sort((a, b) => a.name.localeCompare(b.name));

    const projectPromises = sortedProjects.map((project) => {
        return getProjectImage(project.image).then((imageUrl) => {
            const projectElement = document.createElement("div");
            projectElement.classList.add("project");

            projectElement.innerHTML = `
                <h3><a href="${project.link}" target="_blank">${
                project.name
            }</a></h3>
                <p>${project.description}</p>
                <img src="${imageUrl}" alt="${project.name}">
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

            return projectElement;
        });
    });

    Promise.all(projectPromises).then((projectElements) => {
        projectElements.forEach((projectElement) => {
            projectsContainer.appendChild(projectElement);
        });
    });
}

function getProjectImage(projectLink) {
    const readmeUrl = `${projectLink}`;
    const defaultImageUrl = "assets/inabakumori-pom-poms.gif";

    return fetch(readmeUrl)
        .then((response) => response.text())
        .then((data) => {
            const imageUrlMatch = data.match(
                /!\[image\]\((https:\/\/(?:github\.com\/user-attachments\/assets\/[^\)]+|github\.com\/Postigic\/code-dump-lmao\/assets\/[^\)]+))\)/
            );
            if (imageUrlMatch) {
                return imageUrlMatch[1];
            } else {
                console.error(`Image not found for project: ${projectLink}`);
                return defaultImageUrl;
            }
        })
        .catch((error) => {
            console.error("Error fetching README:", error);
            return defaultImageUrl;
        });
}
