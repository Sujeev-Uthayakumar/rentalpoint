const flatpickr = require("flatpickr");

function getCalendar(startDate, endDate, disabledDate) {
  const myInput = document.querySelector(".myInput");
  const fp = flatpickr(myInput, {
    dateFormat: "Y-m-d",
    minDate: startDate,
    maxDate: endDate,
    disable: disabledDate,
    mode: "range",
  });
}

module.exports = getCalendar;
