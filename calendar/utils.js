var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function fetchDisplayData() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(window.location.protocol + '//' + window.location.hostname + ':5000/display');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = yield response.json();
        console.log('Fetched display data:', data);
        if (!data || !data.title || !Array.isArray(data.calendar) || !data.number_of_states) {
            throw new Error('Invalid data format');
        }
        // Validate that data.data is a 2D array of numbers
        if (!data.calendar.every(row => Array.isArray(row) && row.every(item => typeof item === 'number'))) {
            throw new Error('Invalid data format: data.data must be a 2D array of numbers');
        }
        return {
            title: data.title,
            calendar: data.calendar,
            number_of_states: data.number_of_states
        };
    });
}
function renderCalendar() {
    // this function will activate and deactivate the buttons
    const calendarContainer = document.getElementById('calendar');
    if (!calendarContainer) {
        console.error('Calendar container not found');
        return;
    }
    let months = document.querySelectorAll('.month');
    if (months.length != 12)
        createCalendar();
    months = document.querySelectorAll('.month');
    fetchDisplayData()
        .then(displayData => {
        const activityTitle = document.getElementById('activity');
        if (activityTitle)
            activityTitle.textContent = displayData.title;
        else
            console.error('Activity title element not found');
        months.forEach((month, monthIndex) => {
            const days = month.querySelectorAll('.day-button');
            days.forEach((day, dayIndex) => {
                if (displayData.calendar[monthIndex] && displayData.calendar[monthIndex][dayIndex])
                    day.classList.add('activated-' + displayData.calendar[monthIndex][dayIndex]);
                else {
                    // remove all activated classes
                    day.classList.forEach(className => {
                        if (className.startsWith('activated-')) {
                            day.classList.remove(className);
                        }
                    });
                }
            });
        });
    })
        .catch(error => {
        console.error('Error fetching display data:', error);
    });
}
function createCalendar() {
    return __awaiter(this, void 0, void 0, function* () {
        // this function will create the buttons
        // and create the month labels
        const calendarContainer = document.getElementById('calendar');
        if (!calendarContainer) {
            console.error('Calendar container not found');
            return;
        }
        // load the svg icons
        const iconNormalSvg = yield fetch('icon.svg', { cache: 'no-store' });
        const iconNormalText = yield iconNormalSvg.text();
        const iconTopSvg = yield fetch('icon-top.svg', { cache: 'no-store' });
        const iconTopText = yield iconTopSvg.text();
        const iconBottomSvg = yield fetch('icon-bottom.svg', { cache: 'no-store' });
        const iconBottomText = yield iconBottomSvg.text();
        // Clear existing calendar content
        calendarContainer.innerHTML = '';
        // Create the month buttons and labels
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (new Date().getFullYear() % 4 === 0 && (new Date().getFullYear() % 100 !== 0 || new Date().getFullYear() % 400 === 0))
            daysInMonth[1] = 29; // Adjust for leap year
        for (let month = 0; month < 12; month++) {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'month';
            calendarContainer.appendChild(monthDiv);
            const monthLabel = document.createElement('p');
            monthLabel.className = 'month-label';
            monthLabel.textContent = new Date(0, month).toLocaleString('default', { month: 'short' });
            monthDiv.appendChild(monthLabel);
            for (let day = 1; day <= daysInMonth[month]; day++) {
                const dayButton = document.createElement('button');
                dayButton.className = 'day-button';
                if (day === 1)
                    dayButton.innerHTML = iconTopText; // Use top icon for the first day
                else if (day === daysInMonth[month])
                    dayButton.innerHTML = iconBottomText; // Use bottom icon for the last day
                else
                    dayButton.innerHTML = iconNormalText; // Use normal icon for other days
                // add the day number to the button
                dayButton.innerHTML += `<p>${day}</p>`;
                // add tooltip with day of week to the button
                const date = new Date(new Date().getFullYear(), month, day);
                const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
                dayButton.title = dayOfWeek;
                monthDiv.appendChild(dayButton);
            }
        }
    });
}
export { fetchDisplayData, renderCalendar, createCalendar };
//# sourceMappingURL=utils.js.map