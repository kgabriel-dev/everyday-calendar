import { renderCalendar, createCalendar } from './utils.js';
window.onload = () => {
    // Initialize the calendar on page load
    createCalendar()
        .then(() => {
        renderCalendar();
    })
        .catch(error => {
        console.error('Error initializing calendar:', error);
    });
    // Refresh the calendar every 5 seconds
    setInterval(() => {
        renderCalendar();
    }, 5000);
};
//# sourceMappingURL=display.js.map