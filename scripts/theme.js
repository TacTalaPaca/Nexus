// Function to enable dark moHOMde
function enableDarkMode() {
    document.documentElement.classList.add('dark-mode');
    document.getElementById('theme-toggle').textContent = ''; // Clear the text
    localStorage.setItem('theme', 'dark');
}
// Function to enable light mode
function enableLightMode() {
    document.documentElement.classList.remove('dark-mode');
    document.getElementById('theme-toggle').textContent = ''; // Clear the text
    localStorage.setItem('theme', 'light');
}
// Function to toggle theme mode
function toggleTheme() {
    if (document.documentElement.classList.contains('dark-mode')) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}
// Check for user preference and apply it
const userThemePreference = localStorage.getItem('theme');
if (userThemePreference === 'dark') {
    enableDarkMode();
} else {
    enableLightMode();
}
