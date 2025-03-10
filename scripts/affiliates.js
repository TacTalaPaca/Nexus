// Initialize affiliate functionality
function initializeAffiliates() {
  const toggle = document.querySelector(".affiliate-toggle");
  const menu = document.querySelector(".affiliate-menu");

  // If elements don't exist yet, wait for component to load
  if (!toggle || !menu) {
    return;
  }

  // Initialize copy buttons
  document.querySelectorAll(".copy-code-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const code = button.dataset.code;
      try {
        await navigator.clipboard.writeText(code);

        // Visual feedback
        const originalText = button.textContent;
        button.textContent = "Copied!";
        button.classList.add("copied");

        // Reset after 2 seconds
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("copied");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    });
  });

  // Existing menu toggle code
  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    localStorage.setItem("affiliateMenuOpen", menu.classList.contains("active"));
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove("active");
      localStorage.setItem("affiliateMenuOpen", false);
    }
  });

  // Restore menu state on page load
  if (localStorage.getItem("affiliateMenuOpen") === "true") {
    menu.classList.add("active");
  }
}

// Listen for DOMContentLoaded to attempt initial setup
document.addEventListener("DOMContentLoaded", initializeAffiliates);

// Listen for component loaded events
document.addEventListener("component:loaded", (e) => {
  if (e.detail.component === "affiliates") {
    initializeAffiliates();
  }
});
