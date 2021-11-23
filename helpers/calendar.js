const flatpickr = require("flatpickr");
const calendarElement = require("../public/js/script");

function getCalendar(startDate, endDate, disabledDate) {
  const fp = flatpickr(calendarElement, {
    dateFormat: "Y-m-d",
    minDate: startDate,
    maxDate: endDate,
    disable: disabledDate,
    mode: "range",
  });
}

module.exports = getCalendar;
