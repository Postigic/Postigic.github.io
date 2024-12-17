fetch("data/portfolio.json")
    .then((response) => response.json())
    .then((data) => generatePortfolio(data));

function generatePortfolio(data) {
    const portfolioSection = document.querySelector(".portfolio");
    portfolioSection.innerHTML = "";

    const sortedYears = Object.keys(data).sort((a, b) => b - a);

    sortedYears.forEach((year) => {
        const yearContainer = document.createElement("div");
        yearContainer.classList.add("year-container");

        const yearHeader = document.createElement("h3");
        yearHeader.textContent = year;
        yearContainer.appendChild(yearHeader);

        const list = document.createElement("ul");

        const sortedTitles = data[year].sort();

        sortedTitles.forEach((title) => {
            const listItem = document.createElement("li");
            listItem.textContent = title;
            list.appendChild(listItem);
        });

        yearContainer.appendChild(list);
        portfolioSection.appendChild(yearContainer);

        observeElement(yearContainer);
    });
}

function observeElement(element) {
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0,
        }
    );

    observer.observe(element);
}
