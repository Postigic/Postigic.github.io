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
