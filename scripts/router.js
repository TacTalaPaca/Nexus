const router = {
    // State management
    pageStates: new Map(),

    init: function() {
        // Initial page load
        this.loadContent(window.location.pathname);
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        // Handle navigation
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

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.loadContent(window.location.pathname);
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.savePageState();
            }
        });

        // Handle service worker messages
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
            // Restore scroll position
            window.scrollTo(0, state.scroll);
            
            // Restore form data
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
    },

    loadContent: async function(url) {
        const content = document.querySelector('.content');
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
            }, 300);
            
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
    }
};
