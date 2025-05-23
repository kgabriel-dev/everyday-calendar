let activities = [];

async function addDayButtons() {
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

    const iconNormalSvg = await fetch('icon.svg', { cache: 'no-store' });
    const iconNormalText = await iconNormalSvg.text();
    const iconTopSvg = await fetch('icon-top.svg', { cache: 'no-store' });
    const iconTopText = await iconTopSvg.text();
    const iconBottomSvg = await fetch('icon-bottom.svg', { cache: 'no-store' });
    const iconBottomText = await iconBottomSvg.text();

    months.forEach((month, index) => {
        const numberOfDays = daysInMonths[index];

        for(let day = 1; day <= numberOfDays; day++) {
            const button = document.createElement('button');

            let svgText = iconNormalText;
            if (day === 1)
                svgText = iconTopText;
            else if (day === numberOfDays)
                svgText = iconBottomText;

            button.innerHTML = svgText + '<p>' + day + '</p>';
            button.classList.add('day-button');

            button.addEventListener('click', () => {
                button.classList.toggle('activated');
                
                updateCurrentActivity();
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

async function loadActivityData() {
    const storageData = await getActivityData();
    const currentActivity = document.querySelector('#activity').textContent;

    if (storageData) {
        let activityData;

        if (storageData[currentActivity])
            activityData = storageData[currentActivity];
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

async function updateCurrentActivity() {
    const months = document.querySelectorAll('.month');

    const currentActivity = document.querySelector('#activity').textContent;
    const storageData = await getActivityData() || {};

    if (!storageData[currentActivity])
        storageData[currentActivity] = [];

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
    saveActivityData(storageData);
}

async function loadActivities() {
    const data = await getActivityData();

    if (data && Object.keys(data).length > 0) {
        activities = Object.keys(data);

        const activityDisplay = document.querySelector('#activity');
        activityDisplay.textContent = activities[0];
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
    deleteButton.onclick = async () => {
        let filteredActivities = activities.filter((a) => a !== activity);

        if(filteredActivities.length == 0) {
            alert('You cannot delete all activities. Please add a new activity before deleting this one.');
            return;
        }

        activities = filteredActivities;

        const oldStorageData = await getActivityData();
        const newStorageData = {};
        
        Object.keys(oldStorageData).forEach((key) => {
            if (key === activity)
                return;

            newStorageData[key] = oldStorageData[key];
        });

        saveActivityData(newStorageData)
            .then(() => loadActivityData())
            .catch((error) => console.error('Error saving activity data:', error));

        activityList.removeChild(rowContainer);

        const activityDisplay = document.querySelector('#activity');
        if (activityDisplay.textContent === activity) {
            if (activities.length > 0) {
                activityDisplay.textContent = activities[0];
            } else {
                activityDisplay.textContent = '';
            }
        }
    }
    actionsContainer.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.textContent = 'Rename';
    editButton.onclick = async () => {
        const newActivity = prompt('Edit activity name:', activity);
        if (newActivity) {
            activities[activities.indexOf(activity)] = newActivity;

            const oldStorageData = await getActivityData();
            const newStorageData = {};
            Object.keys(oldStorageData).forEach((key) => {
                if (key === activity) {
                    newStorageData[newActivity] = oldStorageData[key];
                } else {
                    newStorageData[key] = oldStorageData[key];
                }
            });
            
            saveActivityData(newStorageData);

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
    resetButton.onclick = async () => {
        const confirmReset = confirm('Are you sure you want to reset this activity?');
        if (confirmReset) {
            const storageData = await getActivityData() || {};
            
            for(let i = 0; i < storageData[activity].length; i++) {
                for(let j = 0; j < storageData[activity][i].length; j++) {
                    storageData[activity][i][j] = false;
                }
            }

            saveActivityData(storageData)
                .then(() => loadActivityData())
                .catch((error) => console.error('Error saving activity data:', error));
        }
    }
    actionsContainer.appendChild(resetButton);
}

function initializeSettingsDialog() {
    // add the activities to the list
    activities.forEach((activity) => {
        _createActivityItem(activity);
    })
}

async function addActivity() {
    const activityNameTextbox = document.querySelector('#new-activity-name');
    const activityName = activityNameTextbox.value;

    if(!activityName || activityName.length == 0)
        return;

    _createActivityItem(activityName);
    activities.push(activityName);

    activityNameTextbox.value = '';

    const localStorageData = await getActivityData();
    if (localStorageData) {
        localStorageData[activityName] = [];
        
        await saveActivityData(localStorageData);
    } else {
        const newData = {};
        newData[activityName] = [];
        
        await saveActivityData(newData);
    }
}

async function getActivityData() {
    const response = await fetch('http://localhost:5000/data');
    const data = await response.json();

    return data;
}

async function saveActivityData(data) {
    await fetch('http://localhost:5000/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

window.onload = async function() {
    await addDayButtons();
    setMonthLabels();
    await loadActivities();

    if(activities.length == 0) {
        activities.push('Activity 1');
        
        await saveActivityData({ 'Activity 1': [] });
        
        await loadActivities();
    }

    await loadActivityData();
    initializeSettingsDialog();

    // refresh the activity data every 5 seconds
    setInterval(() => {
        loadActivityData();
    }, 5000);
}