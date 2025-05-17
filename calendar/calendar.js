function addDayButtons() {
    const calendar = document.querySelector('#calendar');
    const months = document.querySelectorAll('.month');
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Check for leap year
    const year = new Date().getFullYear();
    if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
        daysInMonths[1] = 29; // February has 29 days in a leap year
    }

    months.forEach((month, index) => {
        const numberOfDays = daysInMonths[index];

        for(let day = 1; day <= numberOfDays; day++) {
            const button = document.createElement('button');
            button.textContent = day;
            button.classList.add('day-button');
            button.addEventListener('click', () => {
                button.classList.toggle('activated');
                saveStorage();
            });
            month.appendChild(button);
        }
    });
}

function setMonthLabels() {
    const monthLabels = document.querySelectorAll('.month-label');
    
    monthLabels.forEach((label, index) => {
        const date = new Date();
        date.setMonth(index);

        const month = date.toLocaleString('default', { month: 'short' });

        label.textContent = month.charAt(0).toUpperCase() + month.slice(1);
    });
}

function loadStorage() {
    // load from localStorage
    const data = localStorage.getItem('calendarData');

    if (data) {
        const parsedData = JSON.parse(data);
        const months = document.querySelectorAll('.month');

        months.forEach((month, index) => {
            const days = month.querySelectorAll('.day-button');
            days.forEach((day, dayIndex) => {
                if (parsedData[index][dayIndex]) {
                    day.classList.add('activated');
                }
            });
        });
    }
}

function saveStorage() {
    const months = document.querySelectorAll('.month');
    const data = [];

    months.forEach((month) => {
        const days = month.querySelectorAll('.day-button');
        const monthData = [];

        days.forEach((day) => {
            monthData.push(day.classList.contains('activated'));
        });

        data.push(monthData);
    });

    // save to localStorage
    localStorage.setItem('calendarData', JSON.stringify(data));
}

window.onload = function() {
    addDayButtons();
    setMonthLabels();
    loadStorage();
}