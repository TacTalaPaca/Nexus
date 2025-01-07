const router = {
    pageStates: new Map(),
    isInitialLoad: true,

    init: function() {
        this.setupEventListeners();
        this.initializeDropdowns();
        this.isInitialLoad = false;
    },

    setupEventListeners: function() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && !link.classList.contains('theme-switch') && !link.hasAttribute('target')) {
                e.preventDefault();
                const url = link.href;
                if (url !== window.location.href) {
                    this.savePageState();
                    window.history.pushState(null, '', url);
                    this.loadContent(url);
                }
            }
        });

        window.addEventListener('popstate', () => {
            this.loadContent(window.location.pathname);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.savePageState();
            }
        });

        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'OFFLINE') {
                this.handleOffline();
            }
        });
    },

    savePageState: function() {
        const currentPath = window.location.pathname;
        const state = {
            scroll: window.scrollY,
            forms: this.getFormsData()
        };
        this.pageStates.set(currentPath, state);
    },

    getFormsData: function() {
        const forms = {};
        document.querySelectorAll('form').forEach((form, index) => {
            const formData = new FormData(form);
            const formObj = {};
            formData.forEach((value, key) => formObj[key] = value);
            forms[index] = formObj;
        });
        return forms;
    },

    restorePageState: function(path) {
        const state = this.pageStates.get(path);
        if (state) {
            if (state.forms) {
                Object.entries(state.forms).forEach(([formIndex, formData]) => {
                    const form = document.querySelectorAll('form')[formIndex];
                    if (form) {
                        Object.entries(formData).forEach(([key, value]) => {
                            const input = form.elements[key];
                            if (input) input.value = value;
                        });
                    }
                });
            }
        }
        window.scrollTo(0, 0);
    },

    loadContent: async function(url) {
        if (this.isInitialLoad) return;

        const content = document.querySelector('.content');
        content.classList.remove('fade-in');
        content.classList.add('fade-out');
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.querySelector('.content');
            
            setTimeout(() => {
                content.innerHTML = newContent.innerHTML;
                content.classList.remove('fade-out');
                content.classList.add('fade-in');
                this.restorePageState(url);
                this.initializeDropdowns();
                
                // Reinitialize PDF viewer after content change
                if (window.PDFViewer) {
                    new PDFViewer();
                }
            }, 150);
            
        } catch (error) {
            console.error('Error loading page:', error);
            this.handleOffline();
        }
    },

    handleOffline: function() {
        const content = document.querySelector('.content');
        content.innerHTML = `
            <section class="banner">
                <h1>Offline</h1>
                <p>Please check your internet connection</p>
            </section>
        `;
    },

    initializeDropdowns: function() {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const header = dropdown.querySelector('.dropdown-header');
            if (header) {
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);
                
                newHeader.addEventListener('click', () => {
                    const content = dropdown.querySelector('.dropdown-content');
                    if (dropdown.classList.contains('active')) {
                        content.style.transition = 'none';
                        content.style.maxHeight = `${content.scrollHeight}px`;
                        requestAnimationFrame(() => {
                            content.style.transition = 'max-height 0.3s ease';
                            content.style.maxHeight = '0';
                        });
                    } else {
                        content.style.transition = 'max-height 0.3s ease';
                        content.style.maxHeight = `${content.scrollHeight}px`;
                    }
                    dropdown.classList.toggle('active');
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('active');
                            const otherContent = otherDropdown.querySelector('.dropdown-content');
                            otherContent.style.maxHeight = '0';
                        }
                    });
                });
            }
        });
    }
};
