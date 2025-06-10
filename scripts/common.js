function loadSocials(container) {
    fetch("data/socials.json")
        .then((response) => response.json())
        .then((data) => {
            const socialsHTML = data
                .map(
                    ({ url, label, icon }) => `
                    <li>
                        <a class="social-link" href="${url}" 
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="${label}">
                            <i class="${icon}"></i>
                        </a>
                    </li>
                `
                )
                .join("");
            container.querySelector(".social-links").innerHTML = socialsHTML;
        })
        .catch((error) => console.error("Error loading socials:", error));
}

function loadNavbar() {
    fetch("partials/navbar.html")
        .then((response) => response.text())
        .then((data) => {
            const container = document.getElementById("navbar");
            const currentPath = window.location.pathname.split("/").pop();
            container.innerHTML = data;
            document.querySelectorAll(".nav-link").forEach((link) => {
                if (link.getAttribute("href") === currentPath) {
                    link.classList.add("active");
                }
            });
        })
        .catch((error) => console.error("Error loading navbar:", error));
}

function loadFooter() {
    fetch("partials/footer.html")
        .then((response) => response.text())
        .then((data) => {
            const container = document.getElementById("footer");
            container.innerHTML = data;
            loadSocials(container);
            document.querySelector(
                ".footer-text"
            ).innerHTML += `&copy;${new Date().getFullYear()}`;
        })
        .catch((error) => console.error("Error loading footer:", error));
}

function loadBackToTop() {
    fetch("partials/back-to-top.html")
        .then((response) => response.text())
        .then((data) => {
            const container = document.createElement("div");
            container.innerHTML = data;

            document.body.appendChild(container);

            const backToTopButton = document.getElementById("backToTop");
            window.addEventListener("scroll", () => {
                if (window.scrollY > 300) {
                    backToTopButton.classList.add("show");
                } else {
                    backToTopButton.classList.remove("show");
                }
            });

            backToTopButton.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        })
        .catch((error) => console.error("Error loading back-to-top:", error));
}

document.addEventListener("turbo:load", () => {
    const noscriptWarning = document.querySelector(".noscript-warning");
    if (noscriptWarning) noscriptWarning.remove();
});

loadNavbar();
loadFooter();
loadBackToTop();
