const router = {
    init: function() {
        // Initial page load
        this.loadContent(window.location.pathname);

        // Handle navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && !link.classList.contains('theme-switch') && !link.hasAttribute('target')) {
                e.preventDefault();
                const url = link.href;
                if (url !== window.location.href) {
                    window.history.pushState(null, '', url);
                    this.loadContent(url);
                }
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.loadContent(window.location.pathname);
        });
    },

    loadContent: async function(url) {
        const content = document.querySelector('.content');
        content.classList.add('fade-out');
        
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.querySelector('.content');
            
            setTimeout(() => {
                content.innerHTML = newContent.innerHTML;
                content.classList.remove('fade-out');
                content.classList.add('fade-in');
            }, 300);
            
        } catch (error) {
            console.error('Error loading page:', error);
        }
    }
};
