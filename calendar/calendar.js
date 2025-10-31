var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { renderCalendar, createCalendar } from './utils.js';
/**
 * Collects the state of all buttons and the current activity name.
 * Then it sends this data to the server to update the database.
 */
function updateCalendarData() {
    const data = [];
    // Get all month elements (columns)
    const months = document.querySelectorAll('.month');
    // Iterate through each month and collect the state of each day button
    months.forEach(month => {
        const monthData = [];
        // Get all day buttons within the month
        const days = month.querySelectorAll('.day-button');
        // Determine if each day is activated and store the result
        days.forEach(day => {
            monthData.push(day.classList.contains('activated'));
        });
        data.push(monthData);
    });
    // Get the current activity title
    const activityTitleElement = document.getElementById('activity');
    if (!activityTitleElement) {
        console.error('Activity title element not found');
        return;
    }
    const activityTitle = activityTitleElement.textContent;
    // Prepare the payload to send to the server
    const payload = {
        title: activityTitle,
        data: data
    };
    // Send the updated data to the server
    fetch(window.location.protocol + '//' + window.location.hostname + ':5000/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(() => console.log('Calendar data updated successfully'))
        .catch(error => console.error('Error updating calendar data:', error));
}
/**
 * Configures the onclick handlers for all day buttons in the calendar.
 * When a button is clicked, it toggles its "activated" state and updates the server.
 */
function configureCalendarDayButtons() {
    const months = document.querySelectorAll('.month');
    months.forEach(month => {
        const days = month.querySelectorAll('.day-button');
        days.forEach(day => {
            // cast day to HTMLButtonElement
            const dayButton = day;
            dayButton.onclick = () => {
                day.classList.toggle('activated');
                updateCalendarData();
            };
        });
    });
}
/**
 * Fetches the complete list of activities with their data from the server.
 * @returns Promise resolving to the complete list of activities with their data
 */
function fetchCompleteActivityData() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(window.location.protocol + '//' + window.location.hostname + ':5000/complete');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = yield response.json();
        console.log('Fetched complete activity data:', data);
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format: expected an array');
        }
        // Validate each item in the array
        data.forEach(item => {
            if (!item.title || !Array.isArray(item.data) || !item.data.every(row => Array.isArray(row) && row.every(item => typeof item === 'boolean'))) {
                throw new Error('Invalid data format: each item must have a title and a 2D array of booleans');
            }
        });
        return data;
    });
}
/**
 * Initializes the settings dialog by fetching the complete activity data
 * and populating the activity list in the dialog.
 */
function initSettingsDialog() {
    const dialogElement = document.getElementById('settings-dialog');
    if (!dialogElement) {
        console.error('Settings dialog element not found');
        return;
    }
    fetchCompleteActivityData()
        .then(completeData => {
        const activityList = document.getElementById('activity-list');
        if (!activityList) {
            console.error('Activity list element not found');
            return;
        }
        activityList.innerHTML = ''; // Clear existing list
        completeData.forEach(activity => {
            createActivityListItem(activity, activityList);
        });
    })
        .catch(error => {
        console.error('Error fetching complete activity data:', error);
    });
}
/**
 * Creates an activity list item in the settings dialog with action buttons.
 *
 * @param activity The data for the activity (title and data)
 * @param activityList The HTML element representing the activity list
 */
function createActivityListItem(activity, activityList) {
    // Create the row container
    const rowContainer = document.createElement('div');
    rowContainer.classList.add('activity-item');
    activityList.appendChild(rowContainer);
    // Add the activity title label
    const activityLabel = document.createElement('span');
    activityLabel.textContent = activity.title;
    rowContainer.appendChild(activityLabel);
    // Create the container for action buttons
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('activity-actions');
    rowContainer.appendChild(actionsContainer);
    // Create and append action buttons: Delete, Edit, Reset, Select
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
        const completeData = yield fetchCompleteActivityData();
        let filteredActivities = completeData.filter(item => item.title !== activity.title);
        if (filteredActivities.length == 0) {
            alert('You cannot delete all activities. Please add a new activity before deleting this one.');
            return;
        }
        const confirmDelete = confirm(`Are you sure you want to delete the activity "${activity.title}"?`);
        if (!confirmDelete)
            return;
        fetch(window.location.protocol + '//' + window.location.hostname + ':5000/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: activity.title })
        })
            .then(() => {
            console.log(`Activity "${activity.title}" deleted successfully`);
            // Remove the activity from the list
            rowContainer.remove();
            // Update the calendar if the deleted activity was currently displayed
            const activityDisplay = document.querySelector('#activity');
            if (activityDisplay && activityDisplay.textContent === activity.title) {
                activityDisplay.textContent = filteredActivities[0].title; // Set to first remaining activity
            }
        })
            .catch(error => {
            console.error('Error deleting activity:', error);
        });
    });
    actionsContainer.appendChild(deleteButton);
    const editButton = document.createElement('button');
    editButton.textContent = 'Rename';
    editButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
        const newActivity = prompt('Edit activity name:', activityLabel.textContent);
        if (!newActivity || newActivity.trim() === '') {
            alert('Activity name cannot be empty.');
            return;
        }
        if (newActivity === activity.title)
            return;
        fetch(window.location.protocol + '//' + window.location.hostname + ':5000/rename', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ oldTitle: activity.title, newTitle: newActivity })
        })
            .then(() => {
            console.log(`Activity "${activity.title}" renamed to "${newActivity}" successfully`);
            activityLabel.textContent = newActivity;
            activity.title = newActivity; // Update the activity object
            // Update the calendar if the renamed activity was currently displayed
            const activityDisplay = document.querySelector('#activity');
            if (activityDisplay && activityDisplay.textContent === activity.title) {
                activityDisplay.textContent = newActivity; // Update display to new name
            }
        })
            .catch(error => {
            console.error('Error renaming activity:', error);
        });
    });
    actionsContainer.appendChild(editButton);
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
        const confirmReset = confirm('Are you sure you want to reset this activity?');
        if (!confirmReset)
            return;
        fetch(window.location.protocol + '//' + window.location.hostname + ':5000/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: activity.title })
        })
            .then(() => {
            console.log(`Activity "${activity.title}" reset successfully`);
            // Reset the calendar display
            renderCalendar();
        })
            .catch(error => {
            console.error('Error resetting activity:', error);
        });
    });
    actionsContainer.appendChild(resetButton);
    const selectButton = document.createElement('button');
    selectButton.textContent = 'Display';
    selectButton.onclick = () => {
        const activityDisplay = document.querySelector('#activity');
        if (activityDisplay) {
            activityDisplay.textContent = activity.title;
            fetch(window.location.protocol + '//' + window.location.hostname + ':5000/change-display', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: activity.title })
            })
                .then(() => {
                console.log(`Activity "${activity.title}" set as current display`);
                activityLabel.textContent = activity.title; // Update label to match display
                renderCalendar(); // Refresh calendar to show the selected activity
            })
                .catch(error => console.error('Error setting current display:', error));
        }
        else {
            console.error('Activity display element not found');
        }
    };
    actionsContainer.appendChild(selectButton);
}
/**
 * Opens the settings dialog.
 */
function openSettings() {
    const dialog = document.getElementById('settings-dialog');
    if (!dialog) {
        console.error('Settings Dialog not found!');
        return;
    }
    dialog.showModal();
}
window.openSettings = openSettings;
/**
 * Closes the settings dialog.
 */
function closeSettings() {
    const dialog = document.getElementById('settings-dialog');
    if (!dialog) {
        console.error('Settings Dialog not found!');
        return;
    }
    dialog.close();
}
window.closeSettings = closeSettings;
/**
 * Adds a new activity based on user input and updates the activity list.
 */
function addNewActivity() {
    const activityNameElement = document.getElementById('new-activity-name');
    if (!activityNameElement) {
        console.error('New activity name element not found');
        return;
    }
    const newActivityName = activityNameElement.value.trim();
    if (!newActivityName) {
        alert('Activity name cannot be empty.');
        return;
    }
    fetch(window.location.protocol + '//' + window.location.hostname + ':5000/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newActivityName })
    })
        .then(() => {
        console.log(`New activity "${newActivityName}" added successfully`);
    })
        .catch(error => {
        console.error('Error adding new activity:', error);
        alert('Failed to add new activity. Please try again.');
    });
    activityNameElement.value = ''; // Clear the input field
    const activityList = document.getElementById('activity-list');
    if (!activityList) {
        console.error('Activity list element not found');
        return;
    }
    // Create a new activity item in the list
    createActivityListItem({ title: newActivityName, data: [] }, activityList);
}
window.addNewActivity = addNewActivity;
window.onload = () => {
    // Initialize the calendar on page load
    createCalendar()
        .then(() => {
        configureCalendarDayButtons();
        renderCalendar();
    })
        .catch(error => {
        console.error('Error initializing calendar:', error);
    });
    // initialize the settings dialog
    initSettingsDialog();
    // Refresh the calendar every 5 seconds
    setInterval(() => {
        renderCalendar();
    }, 5000);
};
//# sourceMappingURL=calendar.js.map