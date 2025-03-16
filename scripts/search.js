document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const navItems = document.querySelectorAll(".nav-item a");

  // Create an array of all navigation links with their text and URLs
  const navLinks = [];
  navItems.forEach((item) => {
    // Skip the theme toggle link
    if (item.id === "theme") return;

    navLinks.push({
      text: item.innerText.trim(),
      url: item.getAttribute("href"),
      type: item.classList.contains("main-item") ? "main" : "sub",
    });
  });

  // Function to perform search
  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();

    // Clear previous results
    searchResults.innerHTML = "";

    // Hide results container if query is empty
    if (!query) {
      searchResults.classList.remove("active");
      return;
    }

    // Find matching links
    const matches = navLinks.filter((link) => link.text.toLowerCase().includes(query) && link.url);

    // Display results
    if (matches.length > 0) {
      matches.forEach((match) => {
        const resultItem = document.createElement("div");
        resultItem.className = "search-result-item";
        resultItem.innerHTML = `
          <a href="${match.url}" class="${match.type}-result">
            <span class="result-text">${match.text}</span>
            <span class="result-type">${match.type === "main" ? "Page" : "Section"}</span>
          </a>
        `;
        searchResults.appendChild(resultItem);
      });
      searchResults.classList.add("active");
    } else {
      // Show no results message
      const noResults = document.createElement("div");
      noResults.className = "search-result-item no-results";
      noResults.textContent = "No matching pages found";
      searchResults.appendChild(noResults);
      searchResults.classList.add("active");
    }
  }

  // Search on Enter key
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  // Hide results when clicking outside
  document.addEventListener("click", function (event) {
    if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
      searchResults.classList.remove("active");
    }
  });

  // Show results again when focusing on input
  searchInput.addEventListener("focus", function () {
    if (searchInput.value.trim() !== "" && searchResults.children.length > 0) {
      searchResults.classList.add("active");
    }
  });

  // Live search as user types (with delay)
  let searchTimeout;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
  });
});
