function loadNavbar() {
    fetch("partials/navbar.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("navbar").innerHTML = data;
        })
        .catch((error) => console.error("Error loading navbar:", error));
}

function loadFooter() {
    fetch("partials/footer.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("footer").innerHTML = data;
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

loadNavbar();
loadFooter();
loadBackToTop();
