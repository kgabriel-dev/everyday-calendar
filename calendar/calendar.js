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

function loadActivityData() {
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
    const data = localStorage.getItem('calendarData');

    if (data) {
        const parsedData = JSON.parse(data);

        if (Object.keys(parsedData).length > 0) {
            activities = Object.keys(parsedData);

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

    loadActivityData();
}

function prevActivity() {
    const activityDisplay = document.querySelector('#activity');
    const currentActivity = activityDisplay.textContent;

    const currentIndex = activities.indexOf(currentActivity);
    const previousIndex = (currentIndex - 1 + activities.length) % activities.length;

    activityDisplay.textContent = activities[previousIndex];

    loadActivityData();
}

function openSettings() {
    const dialog = document.querySelector('#settings-dialog');
    dialog.showModal();
}

function closeSettings() {
    const dialog = document.querySelector('#settings-dialog');
    dialog.close();
}

function _createActivityItem(activity) {
    const activityList = document.querySelector('#activity-list');

    const rowContainer = document.createElement('div');
    rowContainer.classList.add('activity-item');
    activityList.appendChild(rowContainer);

    const activityLabel = document.createElement('span');
    activityLabel.textContent = activity;
    rowContainer.appendChild(activityLabel);

    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('activity-actions');
    rowContainer.appendChild(actionsContainer);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
        activities = activities.filter((a) => a !== activity);

        if(activities.length == 0) {
            alert('You cannot delete all activities. Please add a new activity before deleting this one.');
            return;
        }

        const oldStorageData = JSON.parse(localStorage.getItem('calendarData'));
        const newStorageData = {};
        
        Object.keys(oldStorageData).forEach((key) => {
            if (key === activity)
                return;

            newStorageData[key] = oldStorageData[key];
        });

        localStorage.setItem('calendarData', JSON.stringify(newStorageData));

        activityList.removeChild(rowContainer);

        const activityDisplay = document.querySelector('#activity');
        if (activityDisplay.textContent === activity) {
            if (activities.length > 0) {
                activityDisplay.textContent = activities[0];
            } else {
                activityDisplay.textContent = '';
            }
        }
        loadActivityData();
    }
    actionsContainer.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.textContent = 'Rename';
    editButton.onclick = () => {
        const newActivity = prompt('Edit activity name:', activity);
        if (newActivity) {
            activities[activities.indexOf(activity)] = newActivity;

            const oldStorageData = JSON.parse(localStorage.getItem('calendarData'));
            const newStorageData = {};
            Object.keys(oldStorageData).forEach((key) => {
                if (key === activity) {
                    newStorageData[newActivity] = oldStorageData[key];
                } else {
                    newStorageData[key] = oldStorageData[key];
                }
            });
            localStorage.setItem('calendarData', JSON.stringify(newStorageData));

            activityLabel.textContent = newActivity;
            
            const activityDisplay = document.querySelector('#activity');
            if (activityDisplay.textContent === activity) {
                activityDisplay.textContent = newActivity;
            }
        }
    }
    actionsContainer.appendChild(editButton);

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.onclick = () => {
        const confirmReset = confirm('Are you sure you want to reset this activity?');
        if (confirmReset) {
            const storageData = JSON.parse(localStorage.getItem('calendarData')) || {};
            
            for(let i = 0; i < storageData[activity].length; i++) {
                for(let j = 0; j < storageData[activity][i].length; j++) {
                    storageData[activity][i][j] = false;
                }
            }

            localStorage.setItem('calendarData', JSON.stringify(storageData));
            loadActivityData();
        }
    }
    actionsContainer.appendChild(resetButton);
}

function initializeSettingsDialog() {
    const dialog = document.querySelector('#settings-dialog');
    
    // add the activities to the list
    activities.forEach((activity) => {
        _createActivityItem(activity);
    })
}

function addActivity() {
    const activityNameTextbox = document.querySelector('#new-activity-name');
    const activityName = activityNameTextbox.value;

    if(!activityName || activityName.length == 0)
        return;

    _createActivityItem(activityName);
    activities.push(activityName);

    activityNameTextbox.value = '';

    const localStorageData = localStorage.getItem('calendarData');
    if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);
        parsedData[activityName] = [];
        localStorage.setItem('calendarData', JSON.stringify(parsedData));
    } else {
        const newData = {};
        newData[activityName] = [];
        localStorage.setItem('calendarData', JSON.stringify(newData));
    }
    saveStorage();
    loadActivityData();
}

window.onload = function() {
    addDayButtons();
    setMonthLabels();
    loadActivities();

    if(activities.length == 0) {
        activities.push('Activity 1');
        localStorage.setItem('calendarData', JSON.stringify({ 'Activity 1': [] }));
        
        loadActivities();
        saveStorage();
    }

    loadActivityData();

    initializeSettingsDialog();
}