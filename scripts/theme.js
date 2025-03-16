// Get theme preference before anything else loads
const savedTheme = localStorage.getItem("theme") || "light";

// Apply theme class to HTML element immediately before the page renders
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

// Initialize theme functionality when navbar is loaded
function initializeTheme() {
  const themeBtn = document.querySelector(".theme");

  // If theme button doesn't exist yet, wait for component to load
  if (!themeBtn) {
    return;
  }

  // Function to enable dark mode
  function enableDarkMode() {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }

  // Function to enable light mode
  function enableLightMode() {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }

  // Function to toggle between light and dark mode
  function toggleTheme() {
    if (document.documentElement.classList.contains("dark")) {
      enableLightMode();
    } else {
      enableDarkMode();
    }
  }

  // Add click event listener for theme toggle
  themeBtn.addEventListener("click", toggleTheme);

  // Make toggleTheme available globally for any onclick handlers
  window.toggleTheme = toggleTheme;
}

// Listen for DOMContentLoaded to attempt initial setup
document.addEventListener("DOMContentLoaded", initializeTheme);

// Listen for component loaded events
document.addEventListener("component:loaded", (e) => {
  if (e.detail.component === "navbar") {
    initializeTheme();
  }
});
