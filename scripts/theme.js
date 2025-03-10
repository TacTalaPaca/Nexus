// Get theme preference before anything else loads
const savedTheme = localStorage.getItem("theme") || "light";

// Apply theme class to HTML element immediately before the page renders
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else if (savedTheme === "oled") {
  document.documentElement.classList.add("oled");
}

// Initialize theme functionality when navbar is loaded
function initializeTheme() {
  const themeBtn = document.querySelector(".theme");

  // If theme button doesn't exist yet, wait for component to load
  if (!themeBtn) {
    return;
  }

  let pressTimer = null;
  let longPressDetected = false;

  // Function to enable dark mode
  function enableDarkMode() {
    document.documentElement.classList.remove("oled");
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }

  // Function to enable light mode
  function enableLightMode() {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("oled");
    localStorage.setItem("theme", "light");
  }

  // Function to enable OLED mode
  function enableOledMode() {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("oled");
    localStorage.setItem("theme", "oled");
  }

  // Function to toggle between light and dark mode
  function toggleTheme() {
    if (document.documentElement.classList.contains("dark")) {
      enableLightMode();
    } else if (document.documentElement.classList.contains("oled")) {
      enableLightMode();
    } else {
      enableDarkMode();
    }
  }

  // Better transition handling for theme changes
  const handleTransitions = (callback) => {
    // Add a class to body that will have a transition rule in CSS
    document.body.classList.add("theme-transition");

    // Execute the theme change
    callback();

    // Remove the transition class after the transition is complete
    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 300); // Match this with the CSS transition duration
  };

  // Long press detection
  themeBtn.addEventListener("mousedown", () => {
    pressTimer = setTimeout(() => {
      longPressDetected = true;
      handleTransitions(() => {
        enableOledMode();
      });
    }, 5000);
  });

  // Touch support for mobile
  themeBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    pressTimer = setTimeout(() => {
      longPressDetected = true;
      handleTransitions(() => {
        enableOledMode();
      });
    }, 5000);
  });

  const cancelLongPress = () => {
    clearTimeout(pressTimer);
    pressTimer = null;
  };

  themeBtn.addEventListener("mouseup", () => {
    cancelLongPress();
    if (!longPressDetected) {
      handleTransitions(() => {
        toggleTheme();
      });
    }
    longPressDetected = false;
  });

  themeBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    cancelLongPress();
    if (!longPressDetected) {
      handleTransitions(() => {
        toggleTheme();
      });
    }
    longPressDetected = false;
  });

  themeBtn.addEventListener("mouseleave", cancelLongPress);
  themeBtn.addEventListener("touchcancel", cancelLongPress);

  // Make toggleTheme available globally for any onclick handlers
  window.toggleTheme = function () {
    handleTransitions(() => {
      toggleTheme();
    });
  };
}

// Listen for DOMContentLoaded to attempt initial setup
document.addEventListener("DOMContentLoaded", initializeTheme);

// Listen for component loaded events
document.addEventListener("component:loaded", (e) => {
  if (e.detail.component === "navbar") {
    initializeTheme();
  }
});
