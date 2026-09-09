# Days Tracker & Date Calculator 📅

A sleek, responsive web application for tracking duration from any start date up to the **present date (current date)** with dedicated separate sections for **Years, Months, Weeks, and Days**, plus persistent browser **`localStorage` session management**.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

---

## ✨ Key Features

### 1. 📌 Sidebar with Start Date & Present Date
- **Start Date Selector**: Pick any start date or use quick presets (*Jan 1st, 30d Ago, 100d Ago, 1y Ago, Today*).
- **Auto-synced Present Date**: Automatically detects and locks to the present (current) date in real-time.
- **Session Labeling**: Assign custom labels or tags to your tracking sessions (e.g., *Gym Streak*, *Project Launch*, *Anniversary*).
- **Responsive Mobile Drawer**: Quick hamburger toggle and overlay backdrop on mobile screens.

### 2. 🗄️ LocalStorage Session Storage
- **Automatic State Persistence**: Current active start date and session title are automatically saved into browser `localStorage` and restored on page refresh.
- **Multi-Session Management**: Click **"Save Session"** to store named tracking sessions into the sidebar list.
- **Session History**: Switch between saved sessions with one click, or delete individual sessions or clear all.

### 3. 📊 Separate Sections for Years, Months, Weeks, and Days
- **📅 Years Section**: Calendar years, exact decimal years (e.g. `2.45 yrs`), countdown to next annual anniversary milestone, and year progress bar.
- **🌙 Months Section**: Total full months elapsed, calendar months + days breakdown, quarters elapsed, and monthly progress bar.
- **📆 Weeks Section**: Total weeks elapsed, remaining days, weekdays (Mon–Fri) count, and weekend days count.
- **☀️ Days & Time Section**: Exact total days, total hours, total minutes, and day-of-the-week indicator.

### 4. ⚖️ Two-Date Comparison Mode
- Easily switch to the secondary tab to calculate the difference between any two arbitrary dates.

---

## 📁 Project Structure

```text
Days-Track-App/
├── index.html   # Semantic HTML5 layout with sidebar, hero card, and breakdown grid
├── style.css    # Responsive glassmorphism styling, color-coded section cards, and drawer
└── script.js    # Calendar math, real-time present date sync, and localStorage session management
```

---

## 🚀 Getting Started

No installation or build dependencies required.

1. Clone or download the repository.
2. Open `index.html` in any modern web browser.

---

## 💻 Tech Stack

- **HTML5** (Semantic structure, modern accessible inputs)
- **Vanilla CSS3** (CSS Variables, Flexbox, CSS Grid, Glassmorphism, Responsive Media Queries)
- **JavaScript (ES6+)** (Calendar arithmetic, Date manipulation, Web Storage API / `localStorage`)

