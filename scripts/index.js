{
    const words = ["Student", "Programmer", "STEM Fanatic", "Weeb"];
    const typewriterElement = document.getElementById("typewriter");
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        const currentWord = words[wordIndex];

        if (!isDeleting) {
            typewriterElement.textContent = currentWord.substring(
                0,
                charIndex + 1
            );
            charIndex++;
            if (charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(typeEffect, 2500);
                return;
            }
        } else {
            typewriterElement.textContent = currentWord.substring(
                0,
                charIndex - 1
            );
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        setTimeout(typeEffect, isDeleting ? 50 : typingSpeed);
    }

    typeEffect();
} // i don't even know... whatever i give up it just works okay

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

    document
        .querySelectorAll(".age")
        .forEach((el) => (el.textContent = `${age} years old`));
}

function loadSocials() {
    fetch("data/socials.json")
        .then((response) => response.json())
        .then((data) => {
            const container = document.getElementById("contact-grid");
            const socialsHTML = data
                .map(
                    ({ url, label, icon, color }) => `
                        <a class="social-card animate-target" href="${url}" 
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="${label}"
                            style="background-color: ${color};">
                            <i class="${icon}"></i>
                            <span>${label}</span>
                        </a>
                `
                )
                .join("");
            container.innerHTML = socialsHTML;

            observeElements({ elements: document.querySelector(".contacts") });
            // stuffing this in here fixes a bug so whatever
        })
        .catch((error) => console.error("Error loading socials:", error));
}

setInterval(updateTime, 1000);
updateTime();
calculateAge();
loadSocials();
observeElements({ elements: document.querySelector(".about") });

console.log(
    "%coh, hi! before you go snooping around, i thought you should know that...\n%c\n" +
        "i made this site with:\n- chatg- i mean with REAL human love\n- ten tons of caffeine\n- a stupendous amount of hate for web dev\n\n%c" +
        "thanks for reading, i hope my ai poisoned code doesn't give you an aneurysm or however you spell it :)",
    "color: red; font-size: 2em;",
    "color: inherit;",
    "color: cyan; font-style: italic;"
);
// professional cornball
