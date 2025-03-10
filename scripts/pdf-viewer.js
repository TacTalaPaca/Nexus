/**
 * Advanced PDF Viewer with enhanced viewing options
 */

class PDFViewer {
  constructor() {
    this.currentPage = 1;
    this.pdfDoc = null;
    this.totalPages = 0;
    this.pageScale = 1.0;
    this.container = null;
    this.isLoading = false;
    this.loadingTimeout = null;
    this.isMobile = window.innerWidth <= 768;
    this.pageRenderingInProgress = false;
    this.pendingRender = null;
    this.resizeTimer = null;

    // View settings
    this.viewMode = "fit-page"; // 'fit-page', 'fit-width', 'fit-height'
    this.layoutMode = "single"; // 'single', 'double', 'scroll'
    this.zoomLevel = 100; // Current zoom percentage
    this.settingsVisible = false;
    this.defaultZoom = true; // Flag to track if we're using default zoom

    this.createViewerElements();
    this.attachEventListeners();
  }

  createViewerElements() {
    // Main container
    this.container = document.createElement("div");
    this.container.className = "pdf-viewer";
    this.container.style.display = "none";

    // Header with title and close button
    const header = document.createElement("div");
    header.className = "pdf-header";

    // Title element
    this.titleElement = document.createElement("div");
    this.titleElement.className = "pdf-title";
    header.appendChild(this.titleElement);

    // Close button
    this.closeButton = document.createElement("button");
    this.closeButton.className = "close-btn";
    this.closeButton.innerHTML = "×";
    this.closeButton.title = "Close (Esc)";
    this.closeButton.setAttribute("aria-label", "Close viewer");
    header.appendChild(this.closeButton);

    this.container.appendChild(header);

    // Content area with canvas
    this.contentArea = document.createElement("div");
    this.contentArea.className = "pdf-content";

    // Scroll container (for scroll mode)
    this.scrollContainer = document.createElement("div");
    this.scrollContainer.className = "pdf-scroll-container";
    this.contentArea.appendChild(this.scrollContainer);

    // Canvas wrapper (for single/double page mode)
    this.canvasWrapper = document.createElement("div");
    this.canvasWrapper.className = "pdf-canvas-wrapper";
    this.contentArea.appendChild(this.canvasWrapper);

    // Loading indicator
    this.loadingElement = document.createElement("div");
    this.loadingElement.className = "pdf-loading";
    this.loadingElement.innerHTML = '<div class="pdf-spinner"></div><span>Loading document...</span>';
    this.contentArea.appendChild(this.loadingElement);

    // Error message container
    this.errorElement = document.createElement("div");
    this.errorElement.className = "pdf-error";
    this.errorElement.style.display = "none";
    this.contentArea.appendChild(this.errorElement);

    this.container.appendChild(this.contentArea);

    // Footer with controls
    const footer = document.createElement("div");
    footer.className = "pdf-controls-footer";

    // Main controls group
    const controls = document.createElement("div");
    controls.className = "pdf-controls";

    // Previous page button
    this.prevButton = document.createElement("button");
    this.prevButton.className = "pdf-btn prev-btn";
    this.prevButton.innerHTML = "❮";
    this.prevButton.title = "Previous page";
    this.prevButton.setAttribute("aria-label", "Previous page");
    controls.appendChild(this.prevButton);

    // Page indicator
    this.pageIndicator = document.createElement("div");
    this.pageIndicator.className = "pdf-page-indicator";
    controls.appendChild(this.pageIndicator);

    // Next page button
    this.nextButton = document.createElement("button");
    this.nextButton.className = "pdf-btn next-btn";
    this.nextButton.innerHTML = "❯";
    this.nextButton.title = "Next page";
    this.nextButton.setAttribute("aria-label", "Next page");
    controls.appendChild(this.nextButton);

    footer.appendChild(controls);

    // Settings button to open popup menu
    this.settingsBtn = document.createElement("button");
    this.settingsBtn.className = "pdf-btn settings-btn";
    this.settingsBtn.innerHTML = "⚙️";
    this.settingsBtn.title = "View settings";
    this.settingsBtn.setAttribute("aria-label", "View settings");
    footer.appendChild(this.settingsBtn);

    this.container.appendChild(footer);

    // Settings popup menu
    this.settingsMenu = document.createElement("div");
    this.settingsMenu.className = "pdf-settings-menu";
    this.settingsMenu.style.display = "none";

    // Layout mode section
    const layoutSection = document.createElement("div");
    layoutSection.className = "settings-section";
    layoutSection.innerHTML = "<h3>Page Layout</h3>";

    // Layout mode options
    this.layoutOptions = document.createElement("div");
    this.layoutOptions.className = "settings-options";

    const layoutModes = [
      { id: "single", label: "Single Page", icon: "📄" },
      { id: "double", label: "Two Pages", icon: "📖" },
      { id: "scroll", label: "Continuous Scroll", icon: "📜" },
    ];

    layoutModes.forEach((mode) => {
      const option = document.createElement("button");
      option.className = `settings-option layout-option ${mode.id}${this.layoutMode === mode.id ? " active" : ""}`;
      option.dataset.mode = mode.id;
      option.innerHTML = `${mode.icon} ${mode.label}`;
      option.addEventListener("click", () => this.setLayoutMode(mode.id));
      this.layoutOptions.appendChild(option);
    });

    layoutSection.appendChild(this.layoutOptions);
    this.settingsMenu.appendChild(layoutSection);

    // Fit mode section
    const fitSection = document.createElement("div");
    fitSection.className = "settings-section";
    fitSection.innerHTML = "<h3>Page Fit</h3>";

    // Fit mode options
    this.fitOptions = document.createElement("div");
    this.fitOptions.className = "settings-options";

    const fitModes = [
      { id: "fit-page", label: "Fit to Page", icon: "🔍" },
      { id: "fit-width", label: "Fit to Width", icon: "↔️" },
      { id: "fit-height", label: "Fit to Height", icon: "↕️" },
    ];

    fitModes.forEach((mode) => {
      const option = document.createElement("button");
      option.className = `settings-option fit-option ${mode.id}${this.viewMode === mode.id ? " active" : ""}`;
      option.dataset.mode = mode.id;
      option.innerHTML = `${mode.icon} ${mode.label}`;
      option.addEventListener("click", () => this.setViewMode(mode.id));
      this.fitOptions.appendChild(option);
    });

    fitSection.appendChild(this.fitOptions);
    this.settingsMenu.appendChild(fitSection);

    // Zoom section
    const zoomSection = document.createElement("div");
    zoomSection.className = "settings-section";
    zoomSection.innerHTML = "<h3>Zoom</h3>";

    // Zoom controls
    const zoomControls = document.createElement("div");
    zoomControls.className = "zoom-controls";

    // Zoom out button
    this.zoomOutBtn = document.createElement("button");
    this.zoomOutBtn.className = "pdf-btn zoom-out";
    this.zoomOutBtn.innerHTML = "−";
    this.zoomOutBtn.title = "Zoom out";
    zoomControls.appendChild(this.zoomOutBtn);

    // Zoom level indicator
    this.zoomLevelEl = document.createElement("div");
    this.zoomLevelEl.className = "zoom-level";
    this.zoomLevelEl.textContent = "100%";
    zoomControls.appendChild(this.zoomLevelEl);

    // Zoom in button
    this.zoomInBtn = document.createElement("button");
    this.zoomInBtn.className = "pdf-btn zoom-in";
    this.zoomInBtn.innerHTML = "+";
    this.zoomInBtn.title = "Zoom in";
    zoomControls.appendChild(this.zoomInBtn);

    zoomSection.appendChild(zoomControls);
    this.settingsMenu.appendChild(zoomSection);

    // Add reset zoom button
    const resetZoomBtn = document.createElement("button");
    resetZoomBtn.className = "reset-zoom";
    resetZoomBtn.innerHTML = "🔄 Reset Zoom";
    resetZoomBtn.title = "Reset zoom level";
    resetZoomBtn.addEventListener("click", () => this.resetZoom());
    zoomSection.appendChild(resetZoomBtn);

    // Add settings menu to container
    this.container.appendChild(this.settingsMenu);

    // Add to document body
    document.body.appendChild(this.container);
  }

  attachEventListeners() {
    // Button event listeners
    this.closeButton.addEventListener("click", () => this.close());
    this.prevButton.addEventListener("click", () => this.goToPrevPage());
    this.nextButton.addEventListener("click", () => this.goToNextPage());

    // Settings menu toggle
    this.settingsBtn.addEventListener("click", () => this.toggleSettingsMenu());

    // Close settings when clicking outside
    document.addEventListener("click", (e) => {
      if (this.settingsVisible && !this.settingsMenu.contains(e.target) && e.target !== this.settingsBtn) {
        this.toggleSettingsMenu(false);
      }
    });

    // Zoom controls
    this.zoomInBtn.addEventListener("click", () => this.zoomIn());
    this.zoomOutBtn.addEventListener("click", () => this.zoomOut());

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (this.container.style.display !== "flex") return;

      if (e.key === "Escape") {
        if (this.settingsVisible) {
          this.toggleSettingsMenu(false);
        } else {
          this.close();
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        this.goToPrevPage();
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        this.goToNextPage();
        e.preventDefault();
      } else if (e.key === "Home") {
        this.goToPage(1);
        e.preventDefault();
      } else if (e.key === "End") {
        this.goToPage(this.totalPages);
        e.preventDefault();
      } else if (e.ctrlKey && (e.key === "=" || e.key === "+")) {
        this.zoomIn();
        e.preventDefault();
      } else if (e.ctrlKey && e.key === "-") {
        this.zoomOut();
        e.preventDefault();
      } else if (e.ctrlKey && e.key === "0") {
        this.resetZoom();
        e.preventDefault();
      }
    });

    // Handle touch events for swipe navigation
    let touchStartX = 0;

    this.contentArea.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    this.contentArea.addEventListener(
      "touchend",
      (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        // Only trigger if it's a significant swipe
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            // Swipe left, go to next page
            this.goToNextPage();
          } else {
            // Swipe right, go to previous page
            this.goToPrevPage();
          }
        }
      },
      { passive: true }
    );

    // Scroll handling for scroll mode
    this.scrollContainer.addEventListener(
      "scroll",
      () => {
        if (this.layoutMode !== "scroll" || !this.pdfDoc) return;

        // Determine current page based on scroll position
        const scrollPosition = this.scrollContainer.scrollTop;
        const pages = this.scrollContainer.querySelectorAll(".pdf-page");

        if (pages.length === 0) return;

        let currentPage = 1;

        // Find the page that is most visible in the viewport
        let maxVisibility = 0;

        pages.forEach((page, index) => {
          const rect = page.getBoundingClientRect();
          const containerRect = this.scrollContainer.getBoundingClientRect();

          // Calculate visibility (how much of the page is in the viewport)
          const visibility = Math.max(0, Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top));

          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            currentPage = index + 1;
          }
        });

        if (this.currentPage !== currentPage) {
          this.currentPage = currentPage;
          this.updateUI();
        }
      },
      { passive: true }
    );

    // Handle window resize
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimer);

      this.resizeTimer = setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;

        if (this.container.style.display === "flex" && this.pdfDoc) {
          this.renderCurrentView(true);
        }
      }, 100);
    });
  }

  toggleSettingsMenu(show = null) {
    this.settingsVisible = show !== null ? show : !this.settingsVisible;
    this.settingsMenu.style.display = this.settingsVisible ? "block" : "none";

    // Change button appearance for active state
    if (this.settingsVisible) {
      this.settingsBtn.classList.add("active");
    } else {
      this.settingsBtn.classList.remove("active");
    }
  }

  setLayoutMode(mode) {
    if (this.layoutMode === mode) return;

    this.layoutMode = mode;

    // Update active class
    const options = this.layoutOptions.querySelectorAll(".layout-option");
    options.forEach((option) => {
      if (option.dataset.mode === mode) {
        option.classList.add("active");
      } else {
        option.classList.remove("active");
      }
    });

    // Reset and re-render
    this.canvasWrapper.innerHTML = "";
    this.scrollContainer.innerHTML = "";

    if (mode === "scroll") {
      this.canvasWrapper.style.display = "none";
      this.scrollContainer.style.display = "block";
      this.renderScrollView();
    } else {
      this.canvasWrapper.style.display = "flex";
      this.scrollContainer.style.display = "none";
      this.renderPage(this.currentPage);
    }
  }

  setViewMode(mode) {
    if (this.viewMode === mode) return;

    this.viewMode = mode;
    this.defaultZoom = true; // Reset to default zoom when changing view mode

    // Update the UI immediately to show changes are occurring
    const options = this.fitOptions.querySelectorAll(".fit-option");
    options.forEach((option) => {
      option.classList.toggle("active", option.dataset.mode === mode);
    });

    // Apply the change and re-render
    this.toggleSettingsMenu(false);
    this.renderCurrentView(true);
  }

  updateZoomUI() {
    this.zoomLevelEl.textContent = `${this.zoomLevel}%`;
  }

  async loadPDFJS() {
    if (typeof pdfjsLib !== "undefined") return;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
      script.onload = () => {
        // Set worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js"));
      document.head.appendChild(script);
    });
  }

  async openPDF(url, title) {
    try {
      // Show the viewer
      this.container.style.display = "flex";
      document.body.classList.add("pdf-open");
      this.titleElement.textContent = title || "Document";

      // Reset zoom level
      this.zoomLevel = 100;
      this.defaultZoom = true;
      this.updateZoomUI();

      // Show loading indicator
      this.showLoading(true);
      this.errorElement.style.display = "none";
      this.canvasWrapper.innerHTML = "";
      this.scrollContainer.innerHTML = "";

      // Load PDF.js if needed
      await this.loadPDFJS();

      // Load the document
      try {
        const loadingTask = pdfjsLib.getDocument(url);

        // Add progress tracking
        loadingTask.onProgress = (progress) => {
          const percent = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
          if (this.loadingElement.querySelector("span")) {
            this.loadingElement.querySelector("span").textContent = `Loading document... ${percent}%`;
          }
        };

        const pdf = await loadingTask.promise;
        this.pdfDoc = pdf;
        this.totalPages = pdf.numPages;
        this.currentPage = 1;

        // Render view based on layout mode
        this.renderCurrentView();
      } catch (error) {
        this.showError(`Could not load PDF: ${error.message}`);
      }
    } catch (error) {
      this.showError(`PDF Viewer Error: ${error.message}`);
    }
  }

  renderCurrentView(isResize = false) {
    // Reset the containers based on the layout mode
    if (this.layoutMode === "scroll") {
      this.canvasWrapper.style.display = "none";
      this.scrollContainer.style.display = "block";
      this.renderScrollView(isResize);
    } else if (this.layoutMode === "double") {
      this.canvasWrapper.style.display = "flex";
      this.scrollContainer.style.display = "none";
      this.renderDoublePage(this.currentPage, isResize);
    } else {
      // single page
      this.canvasWrapper.style.display = "flex";
      this.scrollContainer.style.display = "none";
      this.renderPage(this.currentPage, isResize);
    }
  }

  async renderScrollView(isResize = false) {
    if (!this.pdfDoc) return;

    try {
      if (!isResize) {
        this.showLoading(true);
        this.scrollContainer.innerHTML = "";
      }

      // Clear previous pages if resizing
      if (isResize) {
        this.scrollContainer.innerHTML = "";
      }

      // Store current scroll position ratio
      const scrollRatio = isResize && this.scrollContainer.scrollHeight > 0 ? this.scrollContainer.scrollTop / this.scrollContainer.scrollHeight : 0;

      // Get container dimensions with consistent margins
      const MARGIN = 40;
      const availableWidth = this.scrollContainer.clientWidth - MARGIN * 2;
      const availableHeight = this.contentArea.clientHeight - MARGIN * 2;

      // Render all pages
      for (let i = 1; i <= this.totalPages; i++) {
        const page = await this.pdfDoc.getPage(i);

        const pageContainer = document.createElement("div");
        pageContainer.className = "pdf-page";
        pageContainer.dataset.pageNumber = i;

        const canvas = document.createElement("canvas");
        canvas.className = "pdf-canvas";
        const context = canvas.getContext("2d", { alpha: false });

        // Calculate scale based on view mode - FIXED CALCULATIONS
        const viewport = page.getViewport({ scale: 1.0 });

        let scale;
        switch (this.viewMode) {
          case "fit-width":
            // For continuous scroll, fit width should use the available width
            scale = availableWidth / viewport.width;
            break;
          case "fit-height":
            // For each individual page in continuous mode
            scale = availableHeight / viewport.height;
            break;
          case "fit-page":
          default:
            // For continuous scroll, prefer width fit but keep aspect ratio
            scale = Math.min(availableWidth / viewport.width, availableHeight / viewport.height);
        }

        // Apply zoom AFTER calculating the base scale
        if (!this.defaultZoom) {
          scale = scale * (this.zoomLevel / 100);
        } else {
          // Only update the zoom level on the first page to avoid UI jumps
          if (i === 1) {
            this.zoomLevel = Math.round(scale * 100);
            this.updateZoomUI();
          }
        }

        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Add canvas to page container
        pageContainer.appendChild(canvas);

        // Add page number label
        const pageLabel = document.createElement("div");
        pageLabel.className = "pdf-page-label";
        pageLabel.textContent = `Page ${i}`;
        pageContainer.appendChild(pageLabel);

        // Add to scroll container
        this.scrollContainer.appendChild(pageContainer);

        // Render the page
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        await page.render(renderContext).promise;
      }

      // Restore scroll position after resize
      if (isResize) {
        this.scrollContainer.scrollTop = scrollRatio * this.scrollContainer.scrollHeight;
      } else {
        // Scroll to current page
        const targetPage = this.scrollContainer.querySelector(`[data-page-number="${this.currentPage}"]`);
        if (targetPage) {
          targetPage.scrollIntoView();
        }
      }

      this.updateUI();
      this.showLoading(false);
    } catch (error) {
      console.error("Error rendering scroll view:", error);
      this.showError(`Error rendering document: ${error.message}`);
    }
  }

  async renderDoublePage(pageNum, isResize = false) {
    if (!this.pdfDoc || pageNum < 1 || pageNum > this.totalPages) return;

    // If a rendering is already in progress, queue this request
    if (this.pageRenderingInProgress) {
      this.pendingRender = { pageNum, isResize, double: true };
      return;
    }

    this.pageRenderingInProgress = true;

    try {
      if (!isResize) {
        this.showLoading(true);
      }
      // Clear previous content
      this.canvasWrapper.innerHTML = "";

      // Ensure we have a valid starting page (should be odd for double view)
      const startPage = pageNum % 2 === 0 ? pageNum - 1 : pageNum;

      // Create container for the pair of pages
      const pagesContainer = document.createElement("div");
      pagesContainer.className = "pdf-double-page-container";

      // Render left page
      const leftPage = await this.createPageCanvas(startPage);
      if (leftPage) {
        leftPage.classList.add("pdf-page-left");
        pagesContainer.appendChild(leftPage);
      }

      // Render right page if it exists
      if (startPage + 1 <= this.totalPages) {
        const rightPage = await this.createPageCanvas(startPage + 1);
        if (rightPage) {
          rightPage.classList.add("pdf-page-right");
          pagesContainer.appendChild(rightPage);
        }
      }

      this.canvasWrapper.appendChild(pagesContainer);

      // Update current page and UI
      this.currentPage = startPage;
      this.updateUI();

      // Hide loading indicator
      this.showLoading(false);
    } catch (error) {
      console.error(`Error rendering double page ${pageNum}:`, error);
      this.showError(`Error rendering page: ${error.message}`);
    } finally {
      this.pageRenderingInProgress = false;

      // If there's a pending render, process it now
      if (this.pendingRender) {
        const { pageNum, isResize, double } = this.pendingRender;
        this.pendingRender = null;
        if (double) {
          this.renderDoublePage(pageNum, isResize);
        } else {
          this.renderPage(pageNum, isResize);
        }
      }
    }
  }

  async createPageCanvas(pageNum) {
    try {
      const page = await this.pdfDoc.getPage(pageNum);

      const pageContainer = document.createElement("div");
      pageContainer.className = "pdf-page-container";
      pageContainer.dataset.pageNumber = pageNum;

      const canvas = document.createElement("canvas");
      canvas.className = "pdf-canvas";
      const context = canvas.getContext("2d", { alpha: false });

      // Better viewport calculations with consistent margins
      const viewport = page.getViewport({ scale: 1.0 });

      // For double page mode, each page gets slightly less than half the width
      const MARGIN = 20; // Smaller margin for double page
      const availableWidth = this.canvasWrapper.clientWidth / 2 - MARGIN * 2;
      const availableHeight = this.canvasWrapper.clientHeight - MARGIN * 2;

      // Calculate scale based on view mode - FIXED CALCULATIONS
      let scale;
      switch (this.viewMode) {
        case "fit-width":
          scale = availableWidth / viewport.width;
          break;
        case "fit-height":
          scale = availableHeight / viewport.height;
          break;
        case "fit-page":
        default:
          const scaleX = availableWidth / viewport.width;
          const scaleY = availableHeight / viewport.height;
          scale = Math.min(scaleX, scaleY);
      }

      // Apply zoom AFTER calculating the base scale
      if (!this.defaultZoom) {
        scale = scale * (this.zoomLevel / 100);
      } else {
        // Update zoom level based on the calculated scale
        this.zoomLevel = Math.round(scale * 100);
        this.updateZoomUI();
      }

      const scaledViewport = page.getViewport({ scale });

      // Set canvas dimensions
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      // Add canvas to page container
      pageContainer.appendChild(canvas);

      // Add page number label
      const pageLabel = document.createElement("div");
      pageLabel.className = "pdf-page-number";
      pageLabel.textContent = pageNum.toString();
      pageContainer.appendChild(pageLabel);

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      await page.render(renderContext).promise;

      return pageContainer;
    } catch (error) {
      console.error(`Error creating canvas for page ${pageNum}:`, error);
      return null;
    }
  }

  async renderPage(pageNum, isResize = false) {
    if (!this.pdfDoc || pageNum < 1 || pageNum > this.totalPages) return;

    if (this.pageRenderingInProgress) {
      this.pendingRender = { pageNum, isResize, double: false };
      return;
    }

    this.pageRenderingInProgress = true;

    try {
      if (!isResize) {
        this.showLoading(true);
      }

      // Get the page
      const page = await this.pdfDoc.getPage(pageNum);

      // Clear previous content
      this.canvasWrapper.innerHTML = "";

      // Create page container with proper sizing
      const pageContainer = document.createElement("div");
      pageContainer.className = "pdf-page-container single";
      pageContainer.dataset.pageNumber = pageNum;

      // Create canvas with higher DPI for sharper text
      const canvas = document.createElement("canvas");
      canvas.className = "pdf-canvas";
      const context = canvas.getContext("2d");

      // Get the base viewport at scale 1.0
      const viewport = page.getViewport({ scale: 1.0 });

      // Calculate container dimensions
      const containerWidth = this.canvasWrapper.clientWidth;
      const containerHeight = this.canvasWrapper.clientHeight;

      // Calculate the optimal scale based on view mode
      let scale;
      switch (this.viewMode) {
        case "fit-width":
          // Use 90% of container width for better margin
          scale = (containerWidth * 0.9) / viewport.width;
          break;
        case "fit-height":
          // Use 90% of container height for better margin
          scale = (containerHeight * 0.9) / viewport.height;
          break;
        case "fit-page":
        default:
          // Calculate which dimension is more constraining
          const scaleX = (containerWidth * 0.9) / viewport.width;
          const scaleY = (containerHeight * 0.9) / viewport.height;
          scale = Math.min(scaleX, scaleY);
      }

      // Apply manual zoom if needed
      if (!this.defaultZoom) {
        scale = scale * (this.zoomLevel / 100);
      } else {
        // Update zoom level based on calculated scale
        this.zoomLevel = Math.round(scale * 100);
        this.updateZoomUI();
      }

      // Create a scaled viewport
      const scaledViewport = page.getViewport({ scale });

      // Use device pixel ratio for sharper rendering
      const pixelRatio = window.devicePixelRatio || 1;

      // Set canvas size with pixel ratio consideration
      canvas.width = scaledViewport.width * pixelRatio;
      canvas.height = scaledViewport.height * pixelRatio;

      // Scale the canvas with CSS for proper display
      canvas.style.width = `${scaledViewport.width}px`;
      canvas.style.height = `${scaledViewport.height}px`;

      // Adjust the canvas context for high DPI
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      // Append canvas to container
      pageContainer.appendChild(canvas);
      this.canvasWrapper.appendChild(pageContainer);

      // Render PDF page with enhanced options
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
        enableWebGL: true,
        renderInteractiveForms: true,
      };

      await page.render(renderContext).promise;

      // Add page number indicator
      const pageNumber = document.createElement("div");
      pageNumber.className = "pdf-page-number";
      pageNumber.textContent = pageNum.toString();
      pageContainer.appendChild(pageNumber);

      // Update state and UI
      this.currentPage = pageNum;
      this.updateUI();
      this.showLoading(false);
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
      this.showError(`Error rendering page: ${error.message}`);
    } finally {
      this.pageRenderingInProgress = false;

      if (this.pendingRender) {
        const { pageNum, isResize, double } = this.pendingRender;
        this.pendingRender = null;
        if (double) {
          this.renderDoublePage(pageNum, isResize);
        } else {
          this.renderPage(pageNum, isResize);
        }
      }
    }
  }

  showLoading(isLoading) {
    // Clear any existing timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    if (isLoading) {
      // Only show loading indicator after a short delay
      this.loadingTimeout = setTimeout(() => {
        if (this.isLoading) {
          this.loadingElement.style.display = "flex";
          this.canvasWrapper.classList.add("loading");
          this.scrollContainer.classList.add("loading");
        }
      }, 200);

      this.isLoading = true;
    } else {
      // Hide immediately when done loading
      this.isLoading = false;
      this.loadingElement.style.display = "none";
      this.canvasWrapper.classList.remove("loading");
      this.scrollContainer.classList.remove("loading");
    }
  }

  showError(message) {
    this.showLoading(false);
    this.errorElement.style.display = "flex";
    this.errorElement.innerHTML = `<div class="pdf-error-icon">⚠️</div><p>${message}</p><button class="pdf-error-close">Close</button>`;

    const closeBtn = this.errorElement.querySelector(".pdf-error-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }
  }

  updateUI() {
    // Update page indicator based on layout mode
    if (this.layoutMode === "double") {
      const secondPage = this.currentPage + 1;
      const pageRange = secondPage <= this.totalPages ? `${this.currentPage}-${secondPage}` : this.currentPage.toString();
      this.pageIndicator.textContent = `${pageRange} / ${this.totalPages}`;
    } else {
      this.pageIndicator.textContent = `${this.currentPage} / ${this.totalPages}`;
    }

    // Update button states
    this.prevButton.disabled = this.currentPage <= 1;
    if (this.layoutMode === "double") {
      this.nextButton.disabled = this.currentPage + 1 >= this.totalPages;
    } else {
      this.nextButton.disabled = this.currentPage >= this.totalPages;
    }
  }

  goToPage(pageNumber) {
    if (this.isLoading) return;
    if (pageNumber >= 1 && pageNumber <= this.totalPages && pageNumber !== this.currentPage) {
      // For double page mode, ensure we land on odd pages (1, 3, 5, etc)
      if (this.layoutMode === "double" && pageNumber % 2 === 0) {
        pageNumber--;
      }

      if (this.layoutMode === "scroll") {
        // For scroll mode, scroll to the page
        const targetPage = this.scrollContainer.querySelector(`[data-page-number="${pageNumber}"]`);
        if (targetPage) {
          this.currentPage = pageNumber;
          this.updateUI();
          targetPage.scrollIntoView({ behavior: "smooth" });
        }
      } else if (this.layoutMode === "double") {
        this.renderDoublePage(pageNumber);
      } else {
        this.renderPage(pageNumber);
      }
    }
  }

  goToPrevPage() {
    if (this.currentPage > 1) {
      // For double page mode, go back two pages
      const newPage = this.layoutMode === "double" ? Math.max(1, this.currentPage - 2) : this.currentPage - 1;
      this.goToPage(newPage);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      // For double page mode, go forward two pages
      const newPage = this.layoutMode === "double" ? Math.min(this.totalPages, this.currentPage + 2) : this.currentPage + 1;
      this.goToPage(newPage);
    }
  }

  close() {
    this.container.style.display = "none";
    document.body.classList.remove("pdf-open");

    // Clear any loading timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    // Clean up resources
    this.pdfDoc = null;
    this.currentPage = 1;
    this.totalPages = 0;
    this.isLoading = false;
    this.pageRenderingInProgress = false;
    this.pendingRender = null;
    this.canvasWrapper.innerHTML = "";
    this.scrollContainer.innerHTML = "";
    this.errorElement.style.display = "none";
  }

  zoomIn() {
    this.zoomLevel = Math.min(300, this.zoomLevel + 10);
    this.defaultZoom = false; // Manual zoom
    this.updateZoomUI();
    this.renderCurrentView(true);
  }

  zoomOut() {
    this.zoomLevel = Math.max(50, this.zoomLevel - 10);
    this.defaultZoom = false; // Manual zoom
    this.updateZoomUI();
    this.renderCurrentView(true);
  }

  resetZoom() {
    this.defaultZoom = true;
    this.renderCurrentView(true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the viewer when the document is ready
  window.pdfViewer = new PDFViewer();

  // Set up read buttons
  document.querySelectorAll(".book-action.read").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const bookCard = button.closest(".book-card");
      const bookTitle = bookCard.querySelector(".book-title").textContent;
      const pdfUrl = button.dataset.pdfUrl || `/assets/pdfs/${bookTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`;

      window.pdfViewer.openPDF(pdfUrl, bookTitle);
    });
  });
});
