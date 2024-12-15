// Dropdown Functionality
document.addEventListener('DOMContentLoaded', () => {
          const dropdowns = document.querySelectorAll('.dropdown');
      
          dropdowns.forEach(dropdown => {
              const header = dropdown.querySelector('.dropdown-header');
              
              header.addEventListener('click', () => {
                  // Toggle active class
                  dropdown.classList.toggle('active');
                  
                  // Close other open dropdowns
                  dropdowns.forEach(otherDropdown => {
                      if (otherDropdown !== dropdown) {
                          otherDropdown.classList.remove('active');
                      }
                  });
              });
          });
      });