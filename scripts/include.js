document.addEventListener("DOMContentLoaded", function () {
  // Find all elements with data-include attribute
  const includes = document.querySelectorAll("[data-include]");

  // Process each include
  includes.forEach((element) => {
    const file = element.getAttribute("data-include");

    // Fetch the file
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${file}`);
        }
        return response.text();
      })
      .then((html) => {
        // Insert the HTML into the element
        element.innerHTML = html;

        // Extract component name from path for the event
        const componentName = file.split("/").pop().replace(".html", "");

        // Dispatch custom event when component is loaded
        const event = new CustomEvent("component:loaded", {
          detail: {
            component: componentName,
            element: element,
          },
        });
        document.dispatchEvent(event);
      })
      .catch((error) => {
        console.error("Error including file:", error);
        element.innerHTML = `<p>Error loading component: ${file}</p>`;
      });
  });
});
