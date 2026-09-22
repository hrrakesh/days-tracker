// LocalStorage Keys
const STORAGE_START_DATE_KEY = "days_tracker_start_date";
const STORAGE_SAVED_DATES_KEY = "days_tracker_saved_dates";

// Left Sidebar Elements (Two editable date inputs with calendar pickers)
const presentDateInput = document.getElementById("presentDate");
const presentDatePicker = document.getElementById("presentDatePicker");
const presentCalBtn = document.getElementById("presentCalBtn");
const startDateInput = document.getElementById("startDate");
const startDatePicker = document.getElementById("startDatePicker");
const startCalBtn = document.getElementById("startCalBtn");
const mobileTodayTag = document.getElementById("mobileTodayTag");
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

// Format Date as DD-MM-YYYY (User-facing standard)
function formatDateDMY(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Format Date as YYYY-MM-DD (Required by HTML5 <input type="date">)
function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Convert input date safely to local Date (prioritizes DD-MM-YYYY, DD/MM/YYYY, then YYYY-MM-DD)
function parseDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;

  // 1. Format: DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  let match = str.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);
  if (match) {
    const d = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return new Date(y, m - 1, d);
    }
  }

  // 2. Format: YYYY-MM-DD or YYYY/MM/DD (from native calendar picker)
  match = str.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return new Date(y, m - 1, d);
    }
  }

  // 3. Fallback to Date.parse
  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    const dt = new Date(timestamp);
    if (dt.getFullYear() >= 1000) return dt;
  }

  return null;
}

// Sync text input (DD-MM-YYYY) with its calendar picker (YYYY-MM-DD)
function syncTextToPicker(textInput, picker) {
  if (!picker || !textInput) return;
  const dt = parseDate(textInput.value);
  if (dt) {
    picker.value = formatDateISO(dt);
  }
}

// Format short date for display
function formatShortDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// Get today formatted as DD-MM-YYYY
function getTodayFormatted() {
  return formatDateDMY(new Date());
}

// Update mobile today tag
function updateTodayTag() {
  if (mobileTodayTag) {
    mobileTodayTag.textContent = formatShortDate(new Date());
  }
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
  const first = parseDate(startDateInput.value);
  const second = parseDate(presentDateInput.value);

  if (!first || !second) {
    direction.textContent = "Enter or choose valid dates to calculate";
    mainNumber.textContent = "—";
    mainLabel.textContent = "Days";
    weeks.textContent = "—";
    days.textContent = "—";
    months.textContent = "—";
    years.textContent = "—";
    calendarResult.textContent = "Enter or choose valid dates to see the result.";
    return;
  }

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
    const isSameAsToday = formatDateDMY(first) === getTodayFormatted();
    calendarResult.innerHTML = `<strong>${isSameAsToday ? "Today!" : "Same day!"}</strong> There is no difference between the dates.`;
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
  const dt = parseDate(startDateInput.value);
  if (dt) {
    try {
      localStorage.setItem(STORAGE_START_DATE_KEY, formatDateDMY(dt));
    } catch (e) {}
  }
}

function loadCurrentDateFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_START_DATE_KEY);
    if (saved) {
      const dt = parseDate(saved);
      if (dt) {
        startDateInput.value = formatDateDMY(dt);
        return true;
      }
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
  const dt = parseDate(startDateInput.value);
  if (!dt) return;
  const dateVal = formatDateDMY(dt);

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
    const formattedItemDate = itemDate ? formatDateDMY(itemDate) : s.date;

    const item = document.createElement("div");
    item.className = "saved-item";
    if (formattedItemDate === startDateInput.value) {
      item.classList.add("active");
    }

    const label = document.createElement("span");
    label.className = "saved-date-text";
    label.textContent = formattedItemDate;

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
      startDateInput.value = formattedItemDate;
      syncTextToPicker(startDateInput, startDatePicker);
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

// Event Listeners for First Date (Today Date)
presentDateInput.addEventListener("input", () => {
  syncTextToPicker(presentDateInput, presentDatePicker);
  calculate();
});
presentDateInput.addEventListener("change", () => {
  const dt = parseDate(presentDateInput.value);
  if (dt) {
    presentDateInput.value = formatDateDMY(dt);
    syncTextToPicker(presentDateInput, presentDatePicker);
  }
  calculate();
});

if (presentDatePicker) {
  presentDatePicker.addEventListener("input", () => {
    if (presentDatePicker.value) {
      const dt = parseDate(presentDatePicker.value);
      if (dt) presentDateInput.value = formatDateDMY(dt);
      calculate();
    }
  });
  presentDatePicker.addEventListener("change", () => {
    if (presentDatePicker.value) {
      const dt = parseDate(presentDatePicker.value);
      if (dt) presentDateInput.value = formatDateDMY(dt);
      calculate();
    }
  });
}

// Event Listeners for Second Date (Other Date)
startDateInput.addEventListener("input", () => {
  syncTextToPicker(startDateInput, startDatePicker);
  calculate();
});
startDateInput.addEventListener("change", () => {
  const dt = parseDate(startDateInput.value);
  if (dt) {
    startDateInput.value = formatDateDMY(dt);
    syncTextToPicker(startDateInput, startDatePicker);
  }
  calculate();
});

if (startDatePicker) {
  startDatePicker.addEventListener("input", () => {
    if (startDatePicker.value) {
      const dt = parseDate(startDatePicker.value);
      if (dt) startDateInput.value = formatDateDMY(dt);
      calculate();
    }
  });
  startDatePicker.addEventListener("change", () => {
    if (startDatePicker.value) {
      const dt = parseDate(startDatePicker.value);
      if (dt) startDateInput.value = formatDateDMY(dt);
      calculate();
    }
  });
}

// Open calendar picker instantly
function openCalendar(picker) {
  if (!picker) return;
  try {
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
      return;
    }
  } catch (err) {}
  try {
    picker.focus();
  } catch (err) {}
}

if (presentCalBtn) {
  presentCalBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    syncTextToPicker(presentDateInput, presentDatePicker);
    openCalendar(presentDatePicker);
  });
}

if (startCalBtn) {
  startCalBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    syncTextToPicker(startDateInput, startDatePicker);
    openCalendar(startDatePicker);
  });
}

saveSessionBtn.addEventListener("click", handleSaveDate);
clearSessionsBtn.addEventListener("click", clearAllSavedSessions);

sidebarToggle.addEventListener("click", openSidebar);
sidebarCloseBtn.addEventListener("click", closeSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

// Initialize
function init() {
  const today = new Date();

  // First input defaults to today formatted as DD-MM-YYYY
  presentDateInput.value = formatDateDMY(today);
  if (presentDatePicker) presentDatePicker.value = formatDateISO(today);

  // Second input loaded from storage or defaults to Jan 1st of current year in DD-MM-YYYY
  const hasSaved = loadCurrentDateFromStorage();
  if (!hasSaved) {
    const jan1 = new Date(today.getFullYear(), 0, 1);
    startDateInput.value = formatDateDMY(jan1);
    if (startDatePicker) startDatePicker.value = formatDateISO(jan1);
  } else {
    syncTextToPicker(startDateInput, startDatePicker);
  }

  updateTodayTag();
  calculate();
  renderSavedList();
}

init();


