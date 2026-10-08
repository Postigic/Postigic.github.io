export function observeElements({
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

    const isMobile = window.innerWidth <= 768;
    const threshold = isMobile ? mobileThreshold : desktopThreshold;

    const observer = new IntersectionObserver(
        (entries, observer) => {
            const visibleEntries = entries
                .filter((e) => e.isIntersecting)
                .sort(
                    (a, b) =>
                        Array.from(elements).indexOf(a.target) -
                        Array.from(elements).indexOf(b.target),
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
        { threshold },
    );

    elements.forEach((el) => observer.observe(el));
}

export const achievementFallbackImages = [
    "assets/images/ui/neuro_abs_cinema.jpg",
    "assets/images/ui/inabakumori-plush.jpg",
    "assets/images/ui/inabakumori-rainy-boots.gif",
    "assets/images/ui/iu_.png",
    "assets/images/ui/mliczki9986h1.jpeg",
];

export function getAchievementImage(achievement) {
    if (achievement.image) {
        return `assets/images/achievements/${achievement.image}`;
    }
    return achievementFallbackImages[
        Math.floor(Math.random() * achievementFallbackImages.length)
    ];
}

export function loadSocials(container) {
    if (!container) return;

    fetch("data/socials.json")
        .then((response) => response.json())
        .then((data) => {
            if (!container.isConnected) return;

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
                `,
                )
                .join("");
            const target = container.querySelector(".social-links");
            target.innerHTML = socialsHTML;
        })
        .catch((error) => console.error("Error loading socials:", error));
}

export function preventDupeInit(fn) {
    let lastBody = null;
    return () => {
        if (document.body === lastBody) return;
        lastBody = document.body;
        fn();
    };
}

function updateActiveNavLink() {
    const currentPath = window.location.pathname.split("/").pop();
    document.querySelectorAll("#navbar .nav-link").forEach((link) => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === currentPath,
        );
    });
}

function loadNavbar() {
    const container = document.getElementById("navbar");

    if (container.childElementCount > 0) {
        updateActiveNavLink();
        return;
    }

    fetch("partials/navbar.html")
        .then((response) => response.text())
        .then((data) => {
            container.innerHTML = data;
            updateActiveNavLink();
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
            container.querySelector(".footer-text").innerHTML +=
                ` &copy;${new Date().getFullYear()}`;
        })
        .catch((error) => console.error("Error loading footer:", error));
}

function loadBackToTop() {
    if (document.getElementById("backToTop")) return;

    fetch("partials/back-to-top.html")
        .then((response) => response.text())
        .then((data) => {
            const container = document.createElement("div");
            container.innerHTML = data;

            document.body.appendChild(container);

            const backToTopButton = document.getElementById("backToTop");

            backToTopButton.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });

            if (!window.isBackToTopScrollListenerAdded) {
                window.addEventListener("scroll", () => {
                    const btn = document.getElementById("backToTop");
                    if (!btn) return;
                    if (window.scrollY > 300) {
                        btn.classList.add("show");
                    } else {
                        btn.classList.remove("show");
                    }
                });
                window.isBackToTopScrollListenerAdded = true;
            }
        })
        .catch((error) => console.error("Error loading back-to-top:", error));
}

document.addEventListener("turbo:load", () => {
    const noscriptWarning = document.querySelector(".noscript-warning");
    if (noscriptWarning) noscriptWarning.remove();

    loadNavbar();
    loadFooter();
    loadBackToTop();
});

document.addEventListener("turbo:click", (event) => {
    if (event.detail.url === window.location.href) {
        event.preventDefault();
    }
});

document.addEventListener("turbo:before-cache", () => {
    document
        .querySelectorAll(
            ".achievements, .projects, .skills, #achievements-preview-container, #projects-preview-container",
        )
        .forEach((el) => (el.innerHTML = ""));
});
