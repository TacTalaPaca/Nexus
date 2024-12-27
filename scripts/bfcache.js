// Store page state when hidden
window.addEventListener('pagehide', (event) => {
    // Save scroll position
    sessionStorage.setItem('scrollPos', window.scrollY);
    
    // Save form data if any forms exist
    document.querySelectorAll('form').forEach((form, index) => {
        const formData = new FormData(form);
        const formObj = {};
        formData.forEach((value, key) => {
            formObj[key] = value;
        });
        sessionStorage.setItem(`form_${index}`, JSON.stringify(formObj));
    });
});

// Restore page state when shown
window.addEventListener('pageshow', (event) => {
    // Check if page is being restored from bfcache
    if (event.persisted) {
        // Restore scroll position
        const scrollPos = sessionStorage.getItem('scrollPos');
        if (scrollPos) {
            window.scrollTo(0, parseInt(scrollPos));
        }

        // Restore form data
        document.querySelectorAll('form').forEach((form, index) => {
            const savedForm = sessionStorage.getItem(`form_${index}`);
            if (savedForm) {
                const formObj = JSON.parse(savedForm);
                Object.entries(formObj).forEach(([key, value]) => {
                    const input = form.elements[key];
                    if (input) {
                        input.value = value;
                    }
                });
            }
        });
    }
});

// Add cache control meta tags dynamically
const metaCache = document.createElement('meta');
metaCache.setAttribute('http-equiv', 'Cache-Control');
metaCache.setAttribute('content', 'no-cache, no-store, must-revalidate');
document.head.appendChild(metaCache);