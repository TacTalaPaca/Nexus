// Get language preference from localStorage or default to English
const savedLanguage = localStorage.getItem("language") || "english";

// Apply language class to HTML element immediately before the page renders
document.documentElement.classList.add(savedLanguage);

// Hide or show appropriate language elements on page load
document.addEventListener("DOMContentLoaded", () => {
  applyLanguagePreference(savedLanguage);
});

// Initialize language functionality
function initializeLanguage() {
  const languageBtn = document.querySelector(".language");

  // If language button doesn't exist yet, wait for component to load
  if (!languageBtn) {
    return;
  }

  // Function to switch to Romanian
  function enableRomanian() {
    document.documentElement.classList.remove("english");
    document.documentElement.classList.add("romanian");
    localStorage.setItem("language", "romanian");
    applyLanguagePreference("romanian");
  }

  // Function to switch to English
  function enableEnglish() {
    document.documentElement.classList.remove("romanian");
    document.documentElement.classList.add("english");
    localStorage.setItem("language", "english");
    applyLanguagePreference("english");
  }

  // Function to toggle between languages
  function toggleLanguage() {
    if (document.documentElement.classList.contains("romanian")) {
      enableEnglish();
    } else {
      enableRomanian();
    }
  }

  // Apply the selected language preference by showing/hiding elements
  function applyLanguagePreference(language) {
    const engElements = document.querySelectorAll(".eng");
    const romElements = document.querySelectorAll(".rom");

    if (language === "romanian") {
      engElements.forEach((el) => (el.style.display = "none"));
      romElements.forEach((el) => (el.style.display = "block"));
    } else {
      engElements.forEach((el) => (el.style.display = "block"));
      romElements.forEach((el) => (el.style.display = "none"));
    }
  }

  // Add click event listener for language toggle
  languageBtn.addEventListener("click", toggleLanguage);

  // Make toggle function globally available
  window.toggleLanguage = toggleLanguage;
  window.applyLanguagePreference = applyLanguagePreference;

  // Apply current language preference
  applyLanguagePreference(localStorage.getItem("language") || "english");
}

// Listen for DOMContentLoaded to attempt initial setup
document.addEventListener("DOMContentLoaded", initializeLanguage);

// Listen for component loaded events
document.addEventListener("component:loaded", (e) => {
  if (e.detail.component === "navbar") {
    initializeLanguage();
  }
});
