const date1 = document.getElementById("date1");
const date2 = document.getElementById("date2");

const mainNumber = document.getElementById("mainNumber");
const mainLabel = document.getElementById("mainLabel");
const direction = document.getElementById("direction");

const weeks = document.getElementById("weeks");
const days = document.getElementById("days");
const months = document.getElementById("months");
const years = document.getElementById("years");

const calendarResult = document.getElementById("calendarResult");
const todayBtn = document.getElementById("todayBtn");


// Format Date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// Convert input date safely to local Date
function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}


// Number of days between two dates
function totalDaysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.round(
    Math.abs(a.getTime() - b.getTime()) / msPerDay
  );
}


// Calculate calendar difference:
// Years + Months + Days
function calendarDifference(start, end) {

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;

    const previousMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      0
    );

    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    years,
    months,
    days
  };
}


function calculate() {

  if (!date1.value || !date2.value) {
    direction.textContent = "Select a date to calculate";
    mainNumber.textContent = "—";
    mainLabel.textContent = "Days";

    weeks.textContent = "—";
    days.textContent = "—";
    months.textContent = "—";
    years.textContent = "—";

    calendarResult.textContent =
      "Choose a date to see the result.";

    return;
  }


  const first = parseDate(date1.value);
  const second = parseDate(date2.value);

  let earlier;
  let later;

  if (first < second) {
    earlier = first;
    later = second;

    direction.textContent =
      "📅 The selected date was in the past";
  }
  else if (first > second) {
    earlier = second;
    later = first;

    direction.textContent =
      "🚀 The selected date is in the future";
  }
  else {
    direction.textContent =
      "✨ Both dates are the same";

    mainNumber.textContent = "0";
    mainLabel.textContent = "Days";

    weeks.textContent = "0";
    days.textContent = "0";
    months.textContent = "0";
    years.textContent = "0";

    calendarResult.innerHTML =
      "<strong>Today!</strong> There is no difference between the dates.";

    return;
  }


  // Exact total days
  const totalDays = totalDaysBetween(first, second);

  // Weeks
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Calendar difference
  const calendar = calendarDifference(earlier, later);


  // Main result
  mainNumber.textContent = totalDays.toLocaleString();
  mainLabel.textContent =
    totalDays === 1 ? "Day" : "Days";


  // Details
  weeks.textContent = totalWeeks.toLocaleString();
  days.textContent = remainingDays;
  months.textContent =
    calendar.years * 12 + calendar.months;
  years.textContent = calendar.years;


  // Calendar-style result
  let resultText = "";

  if (calendar.years > 0) {
    resultText += `${calendar.years} ${
      calendar.years === 1 ? "year" : "years"
    } `;
  }

  if (calendar.months > 0) {
    resultText += `${calendar.months} ${
      calendar.months === 1 ? "month" : "months"
    } `;
  }

  if (calendar.days > 0) {
    resultText += `${calendar.days} ${
      calendar.days === 1 ? "day" : "days"
    }`;
  }

  resultText = resultText.trim();

  if (!resultText) {
    resultText = "Less than a month";
  }

  const prefix = first < second ? "" : "";

  calendarResult.innerHTML =
    `<strong>${resultText}</strong> apart`;
}


// Set reference date to today
todayBtn.addEventListener("click", () => {

  const today = new Date();

  date2.value = formatDate(today);

  calculate();
});


// Calculate automatically when dates change
date1.addEventListener("change", calculate);
date2.addEventListener("change", calculate);


// Initialize reference date as today
const today = new Date();

date2.value = formatDate(today);
