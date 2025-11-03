function observeElements({
    elements,
    childSelector = ".animate-target",
    desktopThreshold = 0.9,
    mobileThreshold = 0.4,
    baseDelay = 100,
    onVisibleClass = "visible",
}) {
    if (!elements) return;

    if (!Array.isArray(elements) && !(elements instanceof NodeList)) {
        elements = [elements];
    }

    const isMobile = window.innerWidth <= 700;
    const threshold = isMobile ? mobileThreshold : desktopThreshold;

    const observer = new IntersectionObserver(
        (entries, observer) => {
            const visibleEntries = entries
                .filter((e) => e.isIntersecting)
                .sort(
                    (a, b) =>
                        Array.from(elements).indexOf(a.target) -
                        Array.from(elements).indexOf(b.target)
                );

            visibleEntries.forEach((entry, i) => {
                setTimeout(() => {
                    const el = entry.target;
                    el.classList.add(onVisibleClass);

                    const children = el.querySelectorAll(childSelector);
                    children.forEach((child, j) => {
                        setTimeout(() => {
                            child.classList.add(onVisibleClass);
                        }, baseDelay * j);
                    });

                    observer.unobserve(el);
                }, baseDelay * i);
            });
        },
        { threshold }
    );

    elements.forEach((el) => observer.observe(el));
}

function loadSocials(container) {
    fetch("data/socials.json")
        .then((response) => response.json())
        .then((data) => {
            const socialsHTML = data
                .map(
                    ({ url, label, icon, color }) => `
                    <li>
                        <a class="social-link" href="${url}" 
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="${label}"
                            style="--hover-color: ${color};">
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
