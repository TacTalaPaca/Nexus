function initializeCustomSelect() {
    const customSelect = document.querySelector(".custom-select");
    const selectElement = customSelect.getElementsByTagName("select")[0];
    
    const selectedDiv = document.createElement("DIV");
    selectedDiv.setAttribute("class", "select-selected");
    selectedDiv.innerHTML = selectElement.options[selectElement.selectedIndex].innerHTML;
    customSelect.appendChild(selectedDiv);
    
    const itemsDiv = document.createElement("DIV");
    itemsDiv.setAttribute("class", "select-items select-hide");
    
    itemsDiv.addEventListener('wheel', (e) => {
        e.stopPropagation();
    }, { passive: true });
    
    Array.from(selectElement.options).forEach((option, index) => {
        if (index === 0) return; // Skip the placeholder option
        const optionDiv = document.createElement("DIV");
        optionDiv.innerHTML = option.innerHTML;
        optionDiv.setAttribute('data-number', index); // Add month number
        
        optionDiv.addEventListener("click", function() {
            selectElement.selectedIndex = index;
            selectedDiv.innerHTML = this.innerHTML;
            
            const sameAsSelected = itemsDiv.getElementsByClassName("same-as-selected");
            Array.from(sameAsSelected).forEach(item => {
                item.removeAttribute("class");
            });
            this.setAttribute("class", "same-as-selected");
            
            const event = new Event('change');
            selectElement.dispatchEvent(event);
            
            selectedDiv.click();
        });
        
        itemsDiv.appendChild(optionDiv);
    });
    
    customSelect.appendChild(itemsDiv);
    
    selectedDiv.addEventListener("click", function(e) {
        e.stopPropagation();
        this.classList.toggle("select-arrow-active");
        itemsDiv.classList.toggle("select-hide");
        
        if (!itemsDiv.classList.contains("select-hide")) {
            itemsDiv.classList.add("show");
            itemsDiv.style.opacity = "1";
            itemsDiv.style.transform = "translateY(0) scale(1)";
        } else {
            itemsDiv.classList.remove("show");
            itemsDiv.style.opacity = "0";
            itemsDiv.style.transform = "translateY(-10px) scale(0.95)";
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeInputHandlers();
    initializeYearsGrid();
    initializeCustomSelect(); // Add this line
});

document.addEventListener("click", function(e) {
    const selects = document.getElementsByClassName("select-selected");
    Array.from(selects).forEach(select => {
        if (e.target !== select) {
            select.classList.remove("select-arrow-active");
            const items = select.nextElementSibling;
            if (items) {
                items.classList.add("select-hide");
                items.style.opacity = "0";
                items.style.transform = "translateY(-10px)";
            }
        }
    });
});

function initializeInputHandlers() {
    const yearInput = document.getElementById('year');
    const monthInput = document.getElementById('month');
    const dayInput = document.getElementById('day');

    // Add scroll handlers
    yearInput.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        adjustYear(delta);
    });

    dayInput.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        adjustDay(delta);
    });

    // Improve year input handling
    let yearTimeout;
    yearInput.addEventListener('input', (e) => {
        clearTimeout(yearTimeout);
        yearTimeout = setTimeout(() => {
            validateYear(yearInput);
        }, 1000);
    });

    // Existing handlers
    monthInput.addEventListener('change', () => updateDayLimit(monthInput.value, yearInput.value));
    dayInput.addEventListener('input', () => validateDay(dayInput, monthInput.value, yearInput.value));

    // Add click handlers for number controls
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission
            const delta = e.target.textContent === '▲' ? 1 : -1;
            if (btn.closest('.date-field').querySelector('#year')) {
                adjustYear(delta);
            } else if (btn.closest('.date-field').querySelector('#day')) {
                adjustDay(delta);
            }
        });
    });
}

function validateYear(yearInput) {
    const currentYear = new Date().getFullYear();
    let value = parseInt(yearInput.value);
    
    if (isNaN(value)) {
        yearInput.value = '';
        return;
    }

    if (value < 1900) yearInput.value = 1900;
    if (value > currentYear) yearInput.value = currentYear;
    
    updateDayLimit(document.getElementById('month').value, yearInput.value);
}

function validateDay(dayInput, month, year) {
    const maxDays = getDaysInMonth(month, year);
    let value = parseInt(dayInput.value);
    
    if (value < 1) dayInput.value = 1;
    if (value > maxDays) dayInput.value = maxDays;
}

function updateDayLimit(month, year) {
    const dayInput = document.getElementById('day');
    const currentValue = parseInt(dayInput.value) || 0;
    const maxDays = getDaysInMonth(month, year);
    
    dayInput.max = maxDays;
    
    if (currentValue > maxDays) {
        dayInput.value = maxDays;
    }
}

function getDaysInMonth(month, year) {
    if (!month || !year) return 31;
    
    // Convert to numbers
    month = parseInt(month);
    year = parseInt(year);
    
    // Months with 31 days
    if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return 31;
    
    // February (leap year calculation)
    if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
    }
    
    // All other months have 30 days
    return 30;
}

function isLeapYear(year) {
    year = parseInt(year);
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function calculateAge() {
    const yearInput = document.getElementById('year');
    const monthInput = document.getElementById('month');
    const dayInput = document.getElementById('day');

    // Validate all inputs are filled
    if (!yearInput.value || !monthInput.value || !dayInput.value) {
        alert('Please fill in all date fields');
        return;
    }

    const birthDate = new Date(yearInput.value, monthInput.value - 1, dayInput.value);
    const today = new Date();

    // Validate birth date is not in the future
    if (birthDate > today) {
        alert('Birth date cannot be in the future');
        return;
    }

    // Calculate age with decimal points for partial years
    const ageInMilliseconds = today - birthDate;
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    const fullYears = Math.floor(ageInYears);
    const remainder = ageInYears - fullYears;

    updateYearsGrid(fullYears, remainder);
}

function updateYearsGrid(fullYears, remainder) {
    const yearsGrid = document.getElementById('yearsGrid');
    yearsGrid.innerHTML = '';

    for (let i = 0; i < 80; i++) {
        const yearBox = document.createElement('div');
        yearBox.className = 'year-box';

        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.textContent = `Year ${i + 1}`;

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';

        // Calculate progress
        let progress = 0;
        if (i < fullYears) {
            progress = 100;
        } else if (i === fullYears) {
            progress = Math.round(remainder * 100);
        }

        setTimeout(() => {
            progressFill.style.width = `${progress}%`;
        }, i * 50);

        progressBar.appendChild(progressFill);
        yearBox.appendChild(yearLabel);
        yearBox.appendChild(progressBar);
        yearsGrid.appendChild(yearBox);
    }
}

function initializeYearsGrid() {
    const yearsGrid = document.getElementById('yearsGrid');
    for (let i = 0; i < 80; i++) {
        const yearBox = document.createElement('div');
        yearBox.className = 'year-box';

        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.textContent = `Year ${i + 1}`;

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';

        progressBar.appendChild(progressFill);
        yearBox.appendChild(yearLabel);
        yearBox.appendChild(progressBar);
        yearsGrid.appendChild(yearBox);
    }
}

// Add these new functions
function adjustYear(delta) {
    const yearInput = document.getElementById('year');
    const currentValue = parseInt(yearInput.value) || new Date().getFullYear();
    const newValue = Math.min(Math.max(currentValue + delta, 1900), new Date().getFullYear());
    yearInput.value = newValue;
    updateDayLimit(document.getElementById('month').value, newValue);
}

function adjustDay(delta) {
    const dayInput = document.getElementById('day');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');
    const maxDays = getDaysInMonth(monthInput.value, yearInput.value);
    const currentValue = parseInt(dayInput.value) || 1;
    const newValue = Math.min(Math.max(currentValue + delta, 1), maxDays);
    dayInput.value = newValue;
}
