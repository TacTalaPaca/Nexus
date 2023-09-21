// Function to show a page
function showPage(pageId) {
    var pages = document.getElementsByClassName("content")[0].children;
    for (var i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }
    document.getElementById(pageId).style.display = "block";

    // Store the selected page in localStorage
    localStorage.setItem('selectedPage', pageId);
}
// Check for user preference and apply it
window.onload = function() {
    const userSelectedPage = localStorage.getItem('selectedPage');
    if (userSelectedPage) {
        showPage(userSelectedPage);
    } else {
        // If there's no selected page in localStorage, default to 'pg1'
        showPage('pg1');
    }
};
