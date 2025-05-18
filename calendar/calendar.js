let activities = [];

function addDayButtons() {
    const months = [];
    for(let i = 0; i < 12; i++) {
        const month = document.createElement('div');
        month.classList.add('month');
        document.querySelector('#calendar').appendChild(month);

        const monthLabel = document.createElement('p');
        monthLabel.classList.add('month-label');
        monthLabel.textContent = '';
        month.appendChild(monthLabel);

        months.push(month);
    }

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
    const storageData = localStorage.getItem('calendarData');
    const currentActivity = document.querySelector('#activity').textContent;

    if (storageData) {
        const parsedData = JSON.parse(storageData);
        let activityData;

        if (parsedData[currentActivity])
            activityData = parsedData[currentActivity];
        else
            activityData = [];

        const months = document.querySelectorAll('.month');

        months.forEach((month, monthIndex) => {
            const days = month.querySelectorAll('.day-button');
            days.forEach((day, dayIndex) => {
                if (activityData[monthIndex] && activityData[monthIndex][dayIndex]) {
                    day.classList.add('activated');
                } else {
                    day.classList.remove('activated');
                }
            });
        });
    } 
}

function saveStorage() {
    const months = document.querySelectorAll('.month');

    const currentActivity = document.querySelector('#activity').textContent;
    const storageData = JSON.parse(localStorage.getItem('calendarData')) || {};

    const currentData = [];

    months.forEach((month) => {
        const days = month.querySelectorAll('.day-button');
        const monthData = [];

        days.forEach((day) => {
            monthData.push(day.classList.contains('activated'));
        });

        currentData.push(monthData);
    });

    storageData[currentActivity] = currentData;

    // save to localStorage
    localStorage.setItem('calendarData', JSON.stringify(storageData));
}

function loadActivities() {
    const data = localStorage.getItem('activitiesData');

    if (data) {
        const parsedData = JSON.parse(data);

        if (parsedData.length && parsedData.length > 0) {
            activities = parsedData;

            const activityDisplay = document.querySelector('#activity');
            activityDisplay.textContent = activities[0];
        }
    }
}

function nextActivity() {
    const activityDisplay = document.querySelector('#activity');
    const currentActivity = activityDisplay.textContent;

    const currentIndex = activities.indexOf(currentActivity);
    const nextIndex = (currentIndex + 1) % activities.length;

    activityDisplay.textContent = activities[nextIndex];

    loadStorage();
}

function prevActivity() {
    const activityDisplay = document.querySelector('#activity');
    const currentActivity = activityDisplay.textContent;

    const currentIndex = activities.indexOf(currentActivity);
    const previousIndex = (currentIndex - 1 + activities.length) % activities.length;

    activityDisplay.textContent = activities[previousIndex];

    loadStorage();
}

window.onload = function() {
    addDayButtons();
    setMonthLabels();
    loadActivities();

    if(activities.length == 0) {
        activities.push('Activity 1');

        localStorage.setItem('activitiesData', JSON.stringify(activities));
        
        loadActivities();
        saveStorage();
    }

    loadStorage();
}