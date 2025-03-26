document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu button functionality
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector(".nav");
  const menuOverlay = document.querySelector(".menu-overlay");

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", function () {
      this.classList.toggle("active");
      nav.classList.toggle("open");

      if (menuOverlay) {
        menuOverlay.classList.toggle("active");
      }
    });
  }

  // Close menu when overlay is clicked
  if (menuOverlay) {
    menuOverlay.addEventListener("click", function () {
      this.classList.remove("active");
      nav.classList.remove("open");
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove("active");
      }
    });
  }

  // Submenu toggle functionality
  const submenuToggles = document.querySelectorAll(".submenu-toggle");
  submenuToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Toggle active class on button
      this.classList.toggle("active");

      // Find the target submenu using the data-target attribute
      const targetId = this.getAttribute("data-target");
      const submenu = document.getElementById(targetId);

      // Close other open submenus on mobile
      if (window.innerWidth <= 768) {
        const allSubmenus = document.querySelectorAll(".sub-menu");
        const allToggles = document.querySelectorAll(".submenu-toggle");

        allSubmenus.forEach((menu) => {
          if (menu !== submenu && menu.classList.contains("expanded")) {
            menu.classList.remove("expanded");
          }
        });

        allToggles.forEach((btn) => {
          if (btn !== this && btn.classList.contains("active")) {
            btn.classList.remove("active");
          }
        });
      }

      if (submenu) {
        submenu.classList.toggle("expanded");
      }
    });
  });

  // Close submenus when clicking outside
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 768) {
      // Check if click is outside the navigation
      const isClickInside = e.target.closest(".nav-item") !== null;

      if (!isClickInside) {
        const allSubmenus = document.querySelectorAll(".sub-menu");
        const allToggles = document.querySelectorAll(".submenu-toggle");

        allSubmenus.forEach((menu) => {
          menu.classList.remove("expanded");
        });

        allToggles.forEach((btn) => {
          btn.classList.remove("active");
        });
      }
    }
  });

  // Handle resize events - close menu when switching from mobile to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && nav.classList.contains("open")) {
      nav.classList.remove("open");
      menuOverlay.classList.remove("active");
      mobileMenuBtn.classList.remove("active");
    }
  });
});
