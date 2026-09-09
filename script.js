/**
 * Days Tracker & Date Calculator
 * Dynamic calculation from Start Date to Present Date (Today)
 * With Separate Sections for Years, Months, Weeks, and Days
 * Persisted in browser localStorage.
 */

// ==========================================
// LocalStorage Keys
// ==========================================
const STORAGE_CURRENT_SESSION_KEY = "days_tracker_current_session";
const STORAGE_SAVED_SESSIONS_KEY = "days_tracker_saved_sessions";

// ==========================================
// DOM Elements: Sidebar & Present Date Tracker
// ==========================================
const startDateInput = document.getElementById("startDate");
const sessionTitleInput = document.getElementById("sessionTitle");
const presentDateDisplay = document.getElementById("presentDateDisplay");
const presentDateFormatted = document.getElementById("presentDateFormatted");
const mobileTodayBadge = document.getElementById("mobileTodayBadge");

const saveSessionBtn = document.getElementById("saveSessionBtn");
const resetTrackerBtn = document.getElementById("resetTrackerBtn");
const clearAllSessionsBtn = document.getElementById("clearAllSessionsBtn");
const sessionsList = document.getElementById("sessionsList");
const emptyState = document.getElementById("emptyState");
const savedCount = document.getElementById("savedCount");
const presetButtons = document.querySelectorAll(".preset-btn");

// Banner & Hero
const directionBadge = document.getElementById("directionBadge");
const activeSessionTitle = document.getElementById("activeSessionTitle");
const bannerStartDate = document.getElementById("bannerStartDate");
const bannerCurrentDate = document.getElementById("bannerCurrentDate");
const heroTotalDays = document.getElementById("heroTotalDays");
const heroDaysLabel = document.getElementById("heroDaysLabel");
const heroHumanSummary = document.getElementById("heroHumanSummary");

// 1. Years Section Elements
const yearMainValue = document.getElementById("yearMainValue");
const yearMainLabel = document.getElementById("yearMainLabel");
const yearDecimalVal = document.getElementById("yearDecimalVal");
const yearDaysToNextVal = document.getElementById("yearDaysToNextVal");
const yearProgressBar = document.getElementById("yearProgressBar");
const yearProgressText = document.getElementById("yearProgressText");

// 2. Months Section Elements
const monthMainValue = document.getElementById("monthMainValue");
const monthMainLabel = document.getElementById("monthMainLabel");
const monthCalendarBreakdown = document.getElementById("monthCalendarBreakdown");
const monthQuartersVal = document.getElementById("monthQuartersVal");
const monthProgressBar = document.getElementById("monthProgressBar");
const monthProgressText = document.getElementById("monthProgressText");

// 3. Weeks Section Elements
const weekMainValue = document.getElementById("weekMainValue");
const weekMainLabel = document.getElementById("weekMainLabel");
const weekRemainderDays = document.getElementById("weekRemainderDays");
const weekWeekdaysVal = document.getElementById("weekWeekdaysVal");
const weekWeekendsVal = document.getElementById("weekWeekendsVal");

// 4. Days Section Elements
const dayMainValue = document.getElementById("dayMainValue");
const dayMainLabel = document.getElementById("dayMainLabel");
const dayHoursVal = document.getElementById("dayHoursVal");
const dayMinutesVal = document.getElementById("dayMinutesVal");
const dayStartDOW = document.getElementById("dayStartDOW");

// Combined Sentence
const summaryCombinedSentence = document.getElementById("summaryCombinedSentence");

// Sidebar & Mobile Controls
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

// Tabs
const tabPresentTracker = document.getElementById("tabPresentTracker");
const tabTwoDateCalc = document.getElementById("tabTwoDateCalc");
const presentTrackerView = document.getElementById("presentTrackerView");
const twoDateCalcView = document.getElementById("twoDateCalcView");

// Mode 2: Two-Date Comparison Elements
const date1 = document.getElementById("date1");
const date2 = document.getElementById("date2");
const todayBtn = document.getElementById("todayBtn");
const mainNumber = document.getElementById("mainNumber");
const mainLabel = document.getElementById("mainLabel");
const direction = document.getElementById("direction");
const weeks = document.getElementById("weeks");
const days = document.getElementById("days");
const months = document.getElementById("months");
const years = document.getElementById("years");
const calendarResult = document.getElementById("calendarResult");


// ==========================================
// Date Utility Functions
// ==========================================

/**
 * Returns today's date normalized to local midnight
 */
function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
function formatDateToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Safely parses YYYY-MM-DD to local Date normalized to midnight
 */
function parseLocalDate(dateString) {
  if (!dateString) return null;
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0])) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/**
 * Formats a Date object nicely for human reading (e.g., "September 9, 2026")
 */
function formatHumanDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Short human date (e.g., "Sep 9, 2026")
 */
function formatShortDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Calculates exact calendar difference (years, months, days) between start and end
 */
function calculateCalendarDiff(start, end) {
  let y = end.getFullYear() - start.getFullYear();
  let m = end.getMonth() - start.getMonth();
  let d = end.getDate() - start.getDate();

  if (d < 0) {
    m--;
    // Days in previous month
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    d += prevMonthDays;
  }

  if (m < 0) {
    y--;
    m += 12;
  }

  return { years: y, months: m, days: d };
}

/**
 * Counts weekdays (Mon-Fri) and weekend days (Sat-Sun)
 */
function countWeekdaysAndWeekends(startDate, endDate) {
  let weekdays = 0;
  let weekends = 0;
  const current = new Date(startDate.getTime());

  while (current < endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekends++;
    } else {
      weekdays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return { weekdays, weekends };
}


// ==========================================
// Main Calculation Logic: Start Date -> Present Date
// ==========================================

function updatePresentDateDisplays() {
  const today = getTodayDate();
  const formattedLong = formatHumanDate(today);
  const formattedShort = formatShortDate(today);

  presentDateDisplay.textContent = formattedShort;
  presentDateFormatted.textContent = formattedLong;
  bannerCurrentDate.textContent = formattedShort;
  if (mobileTodayBadge) {
    mobileTodayBadge.textContent = formattedShort;
  }
}

function calculatePresentTracker() {
  const today = getTodayDate();
  updatePresentDateDisplays();

  const startValue = startDateInput.value;
  const titleValue = (sessionTitleInput.value || "").trim();

  // Update session banner title
  activeSessionTitle.textContent = titleValue || "Days to Present Date";

  if (!startValue) {
    bannerStartDate.textContent = "—";
    directionBadge.textContent = "Waiting for start date...";
    heroTotalDays.textContent = "—";
    heroHumanSummary.textContent = "Select a start date in the sidebar to calculate duration.";

    yearMainValue.textContent = "—";
    yearDecimalVal.textContent = "—";
    yearDaysToNextVal.textContent = "—";
    yearProgressBar.style.width = "0%";
    yearProgressText.textContent = "0%";

    monthMainValue.textContent = "—";
    monthCalendarBreakdown.textContent = "—";
    monthQuartersVal.textContent = "—";
    monthProgressBar.style.width = "0%";
    monthProgressText.textContent = "0%";

    weekMainValue.textContent = "—";
    weekRemainderDays.textContent = "—";
    weekWeekdaysVal.textContent = "—";
    weekWeekendsVal.textContent = "—";

    dayMainValue.textContent = "—";
    dayHoursVal.textContent = "—";
    dayMinutesVal.textContent = "—";
    dayStartDOW.textContent = "—";

    summaryCombinedSentence.textContent = "Please pick a start date in the sidebar.";
    return;
  }

  const start = parseLocalDate(startValue);
  bannerStartDate.textContent = formatShortDate(start);

  const msPerDay = 24 * 60 * 60 * 1000;
  const timeDiff = today.getTime() - start.getTime();
  const totalDays = Math.round(Math.abs(timeDiff) / msPerDay);

  const isPast = timeDiff > 0;
  const isFuture = timeDiff < 0;
  const isToday = timeDiff === 0;

  // Set Direction Badge
  if (isPast) {
    directionBadge.textContent = `⏳ Count-up: ${totalDays.toLocaleString()} days have elapsed since start date`;
  } else if (isFuture) {
    directionBadge.textContent = `🚀 Countdown: ${totalDays.toLocaleString()} days until future date arrives`;
  } else {
    directionBadge.textContent = "✨ Start date is the present date (Today!)";
  }

  // Determine chronological start & end for calendar diff
  const earlier = isFuture ? today : start;
  const later = isFuture ? start : today;

  const calendar = calculateCalendarDiff(earlier, later);
  const totalMonths = calendar.years * 12 + calendar.months;
  const totalWeeks = Math.floor(totalDays / 7);
  const remainderDays = totalDays % 7;

  // Weekdays vs Weekends
  const { weekdays, weekends } = countWeekdaysAndWeekends(earlier, later);

  // Decimal Years & Next Year Progress
  const decimalYears = (totalDays / 365.2425).toFixed(2);
  
  // Next milestone year date
  const nextMilestoneDate = new Date(
    earlier.getFullYear() + calendar.years + 1,
    earlier.getMonth(),
    earlier.getDate()
  );
  const daysUntilNextAnniversary = Math.max(
    0,
    Math.round((nextMilestoneDate.getTime() - later.getTime()) / msPerDay)
  );
  const daysInFullYearCycle = 365;
  const yearProgressPercent = Math.min(
    100,
    Math.max(0, Math.round(((daysInFullYearCycle - daysUntilNextAnniversary) / daysInFullYearCycle) * 100))
  );

  // Month progress
  const daysInCurrentMonth = new Date(later.getFullYear(), later.getMonth() + 1, 0).getDate();
  const monthProgressPercent = Math.min(
    100,
    Math.max(0, Math.round((calendar.days / daysInCurrentMonth) * 100))
  );

  // Start Day of Week
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const startDayName = daysOfWeek[start.getDay()];

  // Quarters
  const quarters = (totalMonths / 3).toFixed(1);

  // ==========================================
  // Update Hero Section
  // ==========================================
  heroTotalDays.textContent = totalDays.toLocaleString();
  heroDaysLabel.textContent = totalDays === 1 ? "Day" : "Days";

  const durationDirectionWord = isFuture ? "remaining until target" : "elapsed since start date";

  // Build human summary
  const summaryParts = [];
  if (calendar.years > 0) {
    summaryParts.push(`${calendar.years} ${calendar.years === 1 ? "year" : "years"}`);
  }
  if (calendar.months > 0) {
    summaryParts.push(`${calendar.months} ${calendar.months === 1 ? "month" : "months"}`);
  }
  if (totalWeeks % 4 > 0 && calendar.years === 0 && calendar.months === 0) {
    summaryParts.push(`${totalWeeks} ${totalWeeks === 1 ? "week" : "weeks"}`);
  }
  if (calendar.days > 0) {
    summaryParts.push(`${calendar.days} ${calendar.days === 1 ? "day" : "days"}`);
  }

  let formattedSummaryText = "";
  if (isToday) {
    formattedSummaryText = "Both dates are today! 0 days difference.";
  } else if (summaryParts.length > 0) {
    formattedSummaryText = `Exactly <strong>${summaryParts.join(", ")}</strong> ${durationDirectionWord}.`;
  } else {
    formattedSummaryText = `Less than a day ${durationDirectionWord}.`;
  }

  heroHumanSummary.innerHTML = formattedSummaryText;

  // ==========================================
  // 1. YEARS SECTION
  // ==========================================
  yearMainValue.textContent = calendar.years.toLocaleString();
  yearMainLabel.textContent = calendar.years === 1 ? "Year" : "Years";
  yearDecimalVal.textContent = `${decimalYears} yrs`;
  yearDaysToNextVal.textContent = isFuture 
    ? `${daysUntilNextAnniversary} days to cycle` 
    : `${daysUntilNextAnniversary} days away`;
  yearProgressBar.style.width = `${yearProgressPercent}%`;
  yearProgressText.textContent = `${yearProgressPercent}% into Year ${calendar.years + 1}`;

  // ==========================================
  // 2. MONTHS SECTION
  // ==========================================
  monthMainValue.textContent = totalMonths.toLocaleString();
  monthMainLabel.textContent = totalMonths === 1 ? "Month" : "Months";
  monthCalendarBreakdown.textContent = `${calendar.months}m ${calendar.days}d`;
  monthQuartersVal.textContent = `${quarters} Quarters`;
  monthProgressBar.style.width = `${monthProgressPercent}%`;
  monthProgressText.textContent = `${calendar.days} of ${daysInCurrentMonth} days (${monthProgressPercent}%)`;

  // ==========================================
  // 3. WEEKS SECTION
  // ==========================================
  weekMainValue.textContent = totalWeeks.toLocaleString();
  weekMainLabel.textContent = totalWeeks === 1 ? "Week" : "Weeks";
  weekRemainderDays.textContent = `${remainderDays} ${remainderDays === 1 ? "day" : "days"}`;
  weekWeekdaysVal.textContent = `${weekdays.toLocaleString()} days`;
  weekWeekendsVal.textContent = `${weekends.toLocaleString()} days`;

  // ==========================================
  // 4. DAYS SECTION
  // ==========================================
  dayMainValue.textContent = totalDays.toLocaleString();
  dayMainLabel.textContent = totalDays === 1 ? "Total Day" : "Total Days";
  dayHoursVal.textContent = `${(totalDays * 24).toLocaleString()} hrs`;
  dayMinutesVal.textContent = `${(totalDays * 24 * 60).toLocaleString()} mins`;
  dayStartDOW.textContent = `${startDayName} (${formatShortDate(start)})`;

  // Combined Bottom Summary Banner
  const titlePrefix = titleValue ? `<strong>"${titleValue}"</strong>: ` : "";
  summaryCombinedSentence.innerHTML = `${titlePrefix}From <strong>${formatShortDate(start)}</strong> to Present Date (<strong>${formatShortDate(today)}</strong>) is <strong>${totalDays.toLocaleString()} days</strong> (${totalWeeks.toLocaleString()} weeks, ${totalMonths.toLocaleString()} months, or ${decimalYears} years).`;

  // Auto-save current inputs to localStorage
  saveCurrentSessionState();
}


// ==========================================
// LocalStorage Session Persistence
// ==========================================

/**
 * Saves current active inputs to localStorage
 */
function saveCurrentSessionState() {
  const sessionData = {
    startDate: startDateInput.value,
    title: (sessionTitleInput.value || "").trim(),
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_CURRENT_SESSION_KEY, JSON.stringify(sessionData));
  } catch (err) {
    console.warn("Unable to save current session to localStorage", err);
  }
}

/**
 * Loads current active inputs from localStorage
 */
function loadCurrentSessionState() {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_SESSION_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.startDate) {
        startDateInput.value = data.startDate;
        sessionTitleInput.value = data.title || "";
        return true;
      }
    }
  } catch (err) {
    console.warn("Unable to parse current session from localStorage", err);
  }
  return false;
}

/**
 * Retrieves all saved sessions from localStorage
 */
function getSavedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_SESSIONS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (err) {
    console.warn("Unable to parse saved sessions from localStorage", err);
  }
  return [];
}

/**
 * Saves array of sessions to localStorage
 */
function setSavedSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_SAVED_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn("Unable to store sessions into localStorage", err);
  }
}

/**
 * Adds or updates a saved session in the list
 */
function handleSaveSessionClick() {
  const startDateVal = startDateInput.value;
  if (!startDateVal) {
    alert("Please select a Start Date before saving!");
    startDateInput.focus();
    return;
  }

  const titleVal = (sessionTitleInput.value || "").trim() || `Tracker (${startDateVal})`;
  const sessions = getSavedSessions();

  // Create new session object
  const newSession = {
    id: "sess_" + Date.now(),
    title: titleVal,
    startDate: startDateVal,
    createdAt: new Date().toISOString()
  };

  // Add to front of array
  sessions.unshift(newSession);
  setSavedSessions(sessions);
  renderSavedSessionsList();

  // Highlight save button briefly
  saveSessionBtn.textContent = "✅ Saved!";
  setTimeout(() => {
    saveSessionBtn.innerHTML = "<span>💾</span> Save Session";
  }, 1200);
}

/**
 * Deletes a session by ID from localStorage
 */
function deleteSession(id, e) {
  if (e) e.stopPropagation();
  const sessions = getSavedSessions().filter((item) => item.id !== id);
  setSavedSessions(sessions);
  renderSavedSessionsList();
}

/**
 * Clears all saved sessions from localStorage
 */
function clearAllSessions() {
  const sessions = getSavedSessions();
  if (sessions.length === 0) return;

  if (confirm("Are you sure you want to clear all saved tracker sessions from localStorage?")) {
    setSavedSessions([]);
    renderSavedSessionsList();
  }
}

/**
 * Loads a saved session into the active tracker
 */
function loadSession(session) {
  startDateInput.value = session.startDate;
  sessionTitleInput.value = session.title || "";
  calculatePresentTracker();
  renderSavedSessionsList(); // update active highlight

  // On mobile, close sidebar automatically after selecting
  if (window.innerWidth <= 860) {
    closeSidebar();
  }
}

/**
 * Renders the saved sessions list into the sidebar
 */
function renderSavedSessionsList() {
  const sessions = getSavedSessions();
  savedCount.textContent = sessions.length;

  // Clear existing items (except emptyState)
  sessionsList.innerHTML = "";

  if (sessions.length === 0) {
    emptyState.style.display = "block";
    sessionsList.appendChild(emptyState);
    return;
  }

  emptyState.style.display = "none";
  const today = getTodayDate();
  const msPerDay = 24 * 60 * 60 * 1000;
  const currentStartVal = startDateInput.value;

  sessions.forEach((session) => {
    const sDate = parseLocalDate(session.startDate);
    let daysDiff = 0;
    if (sDate) {
      daysDiff = Math.round((today.getTime() - sDate.getTime()) / msPerDay);
    }

    const item = document.createElement("div");
    item.className = "session-item";
    if (session.startDate === currentStartVal && session.title === (sessionTitleInput.value || "").trim()) {
      item.classList.add("active");
    }

    const info = document.createElement("div");
    info.className = "session-info";

    const name = document.createElement("div");
    name.className = "session-name";
    name.textContent = session.title;

    const dates = document.createElement("div");
    dates.className = "session-dates";
    dates.textContent = `Since ${formatShortDate(sDate)}`;

    info.appendChild(name);
    info.appendChild(dates);

    const meta = document.createElement("div");
    meta.className = "session-meta";

    const badge = document.createElement("span");
    badge.className = "session-badge";
    badge.textContent = `${daysDiff >= 0 ? daysDiff : Math.abs(daysDiff)}d ${daysDiff >= 0 ? "ago" : "left"}`;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-session-btn";
    delBtn.innerHTML = "🗑️";
    delBtn.title = "Delete this session";
    delBtn.addEventListener("click", (e) => deleteSession(session.id, e));

    meta.appendChild(badge);
    meta.appendChild(delBtn);

    item.appendChild(info);
    item.appendChild(meta);

    item.addEventListener("click", () => loadSession(session));

    sessionsList.appendChild(item);
  });
}


// ==========================================
// Presets Handling
// ==========================================

function applyPreset(presetType) {
  const today = getTodayDate();
  let targetDate = new Date(today);

  switch (presetType) {
    case "start-of-year":
      targetDate = new Date(today.getFullYear(), 0, 1);
      break;
    case "30-days":
      targetDate.setDate(today.getDate() - 30);
      break;
    case "100-days":
      targetDate.setDate(today.getDate() - 100);
      break;
    case "1-year":
      targetDate.setFullYear(today.getFullYear() - 1);
      break;
    case "today":
      targetDate = today;
      break;
    default:
      return;
  }

  startDateInput.value = formatDateToISO(targetDate);
  calculatePresentTracker();
}


// ==========================================
// View Mode Tabs & Sidebar UI
// ==========================================

function switchTab(viewName) {
  if (viewName === "present") {
    tabPresentTracker.classList.add("active");
    tabTwoDateCalc.classList.remove("active");
    presentTrackerView.classList.remove("hidden");
    twoDateCalcView.classList.add("hidden");
  } else {
    tabTwoDateCalc.classList.add("active");
    tabPresentTracker.classList.remove("active");
    twoDateCalcView.classList.remove("hidden");
    presentTrackerView.classList.add("hidden");
  }
}

function openSidebar() {
  sidebar.classList.add("open");
  sidebarBackdrop.classList.add("active");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarBackdrop.classList.remove("active");
}


// ==========================================
// Mode 2: Two-Date Difference Calculator
// ==========================================

function calculateTwoDates() {
  if (!date1.value || !date2.value) {
    direction.textContent = "Select both dates to calculate";
    mainNumber.textContent = "—";
    mainLabel.textContent = "Days";
    weeks.textContent = "—";
    days.textContent = "—";
    months.textContent = "—";
    years.textContent = "—";
    calendarResult.textContent = "Choose dates to see result.";
    return;
  }

  const first = parseLocalDate(date1.value);
  const second = parseLocalDate(date2.value);

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
    calendarResult.innerHTML = "<strong>Same day!</strong> 0 days difference.";
    return;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((later.getTime() - earlier.getTime()) / msPerDay);
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const calendar = calculateCalendarDiff(earlier, later);

  mainNumber.textContent = totalDays.toLocaleString();
  mainLabel.textContent = totalDays === 1 ? "Day" : "Days";

  weeks.textContent = totalWeeks.toLocaleString();
  days.textContent = remainingDays;
  months.textContent = calendar.years * 12 + calendar.months;
  years.textContent = calendar.years;

  const resultWords = [];
  if (calendar.years > 0) resultWords.push(`${calendar.years} ${calendar.years === 1 ? "year" : "years"}`);
  if (calendar.months > 0) resultWords.push(`${calendar.months} ${calendar.months === 1 ? "month" : "months"}`);
  if (calendar.days > 0) resultWords.push(`${calendar.days} ${calendar.days === 1 ? "day" : "days"}`);

  calendarResult.innerHTML = `<strong>${resultWords.join(", ") || "Less than a day"}</strong> apart`;
}


// ==========================================
// Event Listeners & Initialization
// ==========================================

// Inputs change
startDateInput.addEventListener("input", calculatePresentTracker);
startDateInput.addEventListener("change", calculatePresentTracker);
sessionTitleInput.addEventListener("input", calculatePresentTracker);

// Save & Reset Buttons
saveSessionBtn.addEventListener("click", handleSaveSessionClick);
resetTrackerBtn.addEventListener("click", () => {
  startDateInput.value = formatDateToISO(getTodayDate());
  sessionTitleInput.value = "";
  calculatePresentTracker();
});
clearAllSessionsBtn.addEventListener("click", clearAllSessions);

// Presets
presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    applyPreset(btn.dataset.preset);
  });
});

// Sidebar & Tabs
sidebarToggle.addEventListener("click", openSidebar);
sidebarCloseBtn.addEventListener("click", closeSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

tabPresentTracker.addEventListener("click", () => switchTab("present"));
tabTwoDateCalc.addEventListener("click", () => switchTab("two-date"));

// Mode 2 listeners
date1.addEventListener("change", calculateTwoDates);
date2.addEventListener("change", calculateTwoDates);
todayBtn.addEventListener("click", () => {
  date2.value = formatDateToISO(getTodayDate());
  calculateTwoDates();
});


// ==========================================
// Initialization on Page Load
// ==========================================
function init() {
  updatePresentDateDisplays();

  // Mode 2 default
  date2.value = formatDateToISO(getTodayDate());

  // Try loading saved session state from localStorage
  const hasSavedState = loadCurrentSessionState();

  if (!hasSavedState) {
    // Default to Jan 1st of current year for an engaging initial display
    const currentYear = getTodayDate().getFullYear();
    startDateInput.value = `${currentYear}-01-01`;
    sessionTitleInput.value = `Year ${currentYear} Journey`;
  }

  // Calculate Present Tracker
  calculatePresentTracker();

  // Render Saved Sessions from localStorage
  renderSavedSessionsList();
}

// Run init
init();

