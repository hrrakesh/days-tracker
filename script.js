// LocalStorage Keys
const STORAGE_START_DATE_KEY = "days_tracker_start_date";
const STORAGE_SAVED_DATES_KEY = "days_tracker_saved_dates";

// Left Sidebar Elements
const startDateInput = document.getElementById("startDate");
const presentDateInput = document.getElementById("presentDate");
const presentDateLabel = document.getElementById("presentDateLabel");
const mobileTodayTag = document.getElementById("mobileTodayTag");
const setTodayBtn = document.getElementById("setTodayBtn");
const saveSessionBtn = document.getElementById("saveSessionBtn");
const clearSessionsBtn = document.getElementById("clearSessionsBtn");
const savedList = document.getElementById("savedList");
const savedCount = document.getElementById("savedCount");
const emptyHint = document.getElementById("emptyHint");

// Sidebar Toggle Elements
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

// Middle Card Elements (As Old Simple)
const mainNumber = document.getElementById("mainNumber");
const mainLabel = document.getElementById("mainLabel");
const direction = document.getElementById("direction");
const weeks = document.getElementById("weeks");
const days = document.getElementById("days");
const months = document.getElementById("months");
const years = document.getElementById("years");
const calendarResult = document.getElementById("calendarResult");

// Format Date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Convert input date safely to local Date
function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Format short date for display
function formatShortDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// Number of days between two dates
function totalDaysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(a.getTime() - b.getTime()) / msPerDay);
}

// Calculate calendar difference: Years + Months + Days
function calendarDifference(start, end) {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

// Main Calculate Function
function calculate() {
  if (!startDateInput.value || !presentDateInput.value) {
    direction.textContent = "Select a date to calculate";
    mainNumber.textContent = "—";
    mainLabel.textContent = "Days";
    weeks.textContent = "—";
    days.textContent = "—";
    months.textContent = "—";
    years.textContent = "—";
    calendarResult.textContent = "Choose a date to see the result.";
    return;
  }

  const first = parseDate(startDateInput.value);
  const second = parseDate(presentDateInput.value);

  let earlier;
  let later;

  if (first < second) {
    earlier = first;
    later = second;
    direction.textContent = "📅 The selected date was in the past";
  } else if (first > second) {
    earlier = second;
    later = first;
    direction.textContent = "🚀 The selected date is in the future";
  } else {
    direction.textContent = "✨ Both dates are the same";
    mainNumber.textContent = "0";
    mainLabel.textContent = "Days";
    weeks.textContent = "0";
    days.textContent = "0";
    months.textContent = "0";
    years.textContent = "0";
    calendarResult.innerHTML = "<strong>Today!</strong> There is no difference between the dates.";
    saveCurrentDateToStorage();
    renderSavedList();
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
  mainLabel.textContent = totalDays === 1 ? "Day" : "Days";

  // Details: Weeks, Days, Months, Years
  weeks.textContent = totalWeeks.toLocaleString();
  days.textContent = remainingDays;
  months.textContent = calendar.years * 12 + calendar.months;
  years.textContent = calendar.years;

  // Calendar-style result
  let resultText = "";
  if (calendar.years > 0) {
    resultText += `${calendar.years} ${calendar.years === 1 ? "year" : "years"} `;
  }
  if (calendar.months > 0) {
    resultText += `${calendar.months} ${calendar.months === 1 ? "month" : "months"} `;
  }
  if (calendar.days > 0) {
    resultText += `${calendar.days} ${calendar.days === 1 ? "day" : "days"}`;
  }
  resultText = resultText.trim();
  if (!resultText) {
    resultText = "Less than a month";
  }

  calendarResult.innerHTML = `<strong>${resultText}</strong> apart`;

  // Save current date to localStorage
  saveCurrentDateToStorage();
  renderSavedList();
}

// LocalStorage: Save and Load Active Date
function saveCurrentDateToStorage() {
  if (startDateInput.value) {
    try {
      localStorage.setItem(STORAGE_START_DATE_KEY, startDateInput.value);
    } catch (e) {}
  }
}

function loadCurrentDateFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_START_DATE_KEY);
    if (saved) {
      startDateInput.value = saved;
      return true;
    }
  } catch (e) {}
  return false;
}

// LocalStorage: Saved Sessions List
function getSavedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_DATES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {}
  return [];
}

function setSavedSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_SAVED_DATES_KEY, JSON.stringify(sessions));
  } catch (e) {}
}

function handleSaveDate() {
  const dateVal = startDateInput.value;
  if (!dateVal) return;

  const sessions = getSavedSessions();
  const exists = sessions.find((s) => s.date === dateVal);
  if (!exists) {
    sessions.unshift({
      id: "date_" + Date.now(),
      date: dateVal,
      savedAt: new Date().toISOString()
    });
    setSavedSessions(sessions);
    renderSavedList();
  }

  saveSessionBtn.textContent = "✅ Saved";
  setTimeout(() => {
    saveSessionBtn.textContent = "💾 Save";
  }, 1200);
}

function deleteSavedSession(id, e) {
  if (e) e.stopPropagation();
  const sessions = getSavedSessions().filter((s) => s.id !== id);
  setSavedSessions(sessions);
  renderSavedList();
}

function clearAllSavedSessions() {
  if (confirm("Clear all saved sessions from localStorage?")) {
    setSavedSessions([]);
    renderSavedList();
  }
}

function renderSavedList() {
  const sessions = getSavedSessions();
  savedCount.textContent = sessions.length;
  savedList.innerHTML = "";

  if (sessions.length === 0) {
    emptyHint.style.display = "block";
    savedList.appendChild(emptyHint);
    return;
  }

  emptyHint.style.display = "none";
  const today = parseDate(presentDateInput.value) || new Date();

  sessions.forEach((s) => {
    const itemDate = parseDate(s.date);
    const diff = itemDate ? totalDaysBetween(itemDate, today) : 0;
    const isPast = itemDate && itemDate <= today;

    const item = document.createElement("div");
    item.className = "saved-item";
    if (s.date === startDateInput.value) {
      item.classList.add("active");
    }

    const label = document.createElement("span");
    label.className = "saved-date-text";
    label.textContent = s.date;

    const meta = document.createElement("div");
    meta.className = "saved-meta";

    const badge = document.createElement("span");
    badge.className = "saved-badge";
    badge.textContent = `${diff}d ${isPast ? "ago" : "left"}`;

    const del = document.createElement("button");
    del.className = "del-btn";
    del.innerHTML = "✕";
    del.title = "Delete";
    del.addEventListener("click", (e) => deleteSavedSession(s.id, e));

    meta.appendChild(badge);
    meta.appendChild(del);

    item.appendChild(label);
    item.appendChild(meta);

    item.addEventListener("click", () => {
      startDateInput.value = s.date;
      calculate();
      if (window.innerWidth <= 860) {
        closeSidebar();
      }
    });

    savedList.appendChild(item);
  });
}

// Sidebar open / close
function openSidebar() {
  sidebar.classList.add("open");
  sidebarBackdrop.classList.add("active");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarBackdrop.classList.remove("active");
}

// Event Listeners
startDateInput.addEventListener("input", calculate);
startDateInput.addEventListener("change", calculate);

setTodayBtn.addEventListener("click", () => {
  startDateInput.value = presentDateInput.value;
  calculate();
});

saveSessionBtn.addEventListener("click", handleSaveDate);
clearSessionsBtn.addEventListener("click", clearAllSavedSessions);

sidebarToggle.addEventListener("click", openSidebar);
sidebarCloseBtn.addEventListener("click", closeSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

// Initialize
function init() {
  const today = new Date();
  const todayFormatted = formatDate(today);

  presentDateInput.value = todayFormatted;
  presentDateLabel.textContent = formatShortDate(today);
  if (mobileTodayTag) {
    mobileTodayTag.textContent = formatShortDate(today);
  }

  // Load from localStorage or set default
  const hasSaved = loadCurrentDateFromStorage();
  if (!hasSaved) {
    // Default to Jan 1st of current year
    startDateInput.value = `${today.getFullYear()}-01-01`;
  }

  calculate();
  renderSavedList();
}

init();


