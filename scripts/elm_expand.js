// EXPERIMENTAL!!!
// Element expansion logic
document.querySelectorAll('.elm').forEach(elm => {
    elm.addEventListener('click', function(event) {
        // Prevent triggering if close button is clicked
        if (event.target.closest('.close-btn')) return;

        // Remove expanded class from all elements
        document.querySelectorAll('.elm').forEach(e => {
            if (e !== this) e.classList.remove('expanded');
        });

        // Toggle expanded class on clicked element
        this.classList.toggle('expanded');
    });

    // Close button functionality
    const closeBtn = elm.querySelector('.close-btn');
    closeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        elm.classList.remove('expanded');
    });
});

// Optional: Close expanded element when pressing Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const expandedElm = document.querySelector('.elm.expanded');
        if (expandedElm) {
            expandedElm.classList.remove('expanded');
        }
    }
});