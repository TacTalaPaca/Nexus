function showPage(pageId) {
    const content = document.getElementsByClassName("content")[0];
    const pages = content.children;
    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }
    document.getElementById(pageId).style.display = "block";

    localStorage.setItem('selectedPage', pageId);
}
// Check for user preference and apply it
window.onload = function() {
    const selectedPage = localStorage.getItem('selectedPage');
    const defaultPage = 'pg1';
    
    showPage(selectedPage || defaultPage);
};
