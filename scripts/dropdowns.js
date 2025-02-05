const dropdowns = {
    initialize: function() {
        const dropdownElements = document.querySelectorAll('.dropdown');
        dropdownElements.forEach(dropdown => {
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
                    dropdownElements.forEach(otherDropdown => {
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

// Initialize dropdowns on page load
document.addEventListener('DOMContentLoaded', () => {
    dropdowns.initialize();
});
