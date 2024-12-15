function showPage(pageId) {
    const content = document.querySelector(".content");
    const pages = content.children;
    const activePage = content.querySelector(".active");

    if (activePage) {
        // Add fade-out class to current active page
        activePage.classList.add("fade-out");
        activePage.addEventListener("animationend", () => {
            activePage.style.display = "none";
            activePage.classList.remove("active", "fade-out");

            // Show the new page
            const newPage = document.getElementById(pageId);
            newPage.style.display = "block";
            newPage.classList.add("active", "fade-in");
        }, { once: true });
    } else {
        // No active page, show directly
        const newPage = document.getElementById(pageId);
        newPage.style.display = "block";
        newPage.classList.add("active", "fade-in");
    }

    localStorage.setItem("selectedPage", pageId);
}

window.onload = function () {
    const selectedPage = localStorage.getItem("selectedPage") || "pg1";
    showPage(selectedPage);
};