// --- Data Structures & State ---
const timetable = {
    1: [ // Monday
        { name: 'OS', type: 'Lecture', time: '10:30 TO 11:30' },
        { name: 'OOP', type: 'Lecture', time: '11:30 TO 12:30' },
        { name: 'DM', type: 'Lecture', time: '1:00 TO 02:00' },
        { name: 'COA', type: 'Lecture', time: '02:00 TO 03:00' },
        { lab: true, C1: 'ES', C2: 'OS', C3: 'MATHS', C4: 'ADA', time: '03:15 TO 05:15' }
    ],
    2: [ // Tuesday
        { lab: true, C1: 'OS', C2: 'OOP', C3: 'ADA', C4: 'COA', time: '10:30 TO 12:30' },
        { name: 'OS', type: 'Lecture', time: '1:00 TO 02:00' },
        { name: 'COA', type: 'Lecture', time: '02:00 TO 03:00' },
        { lab: true, C1: 'MATHS', C2: 'MATHS', C3: 'ES', C4: 'OS', time: '03:15 TO 05:15' }
    ],
    3: [ // Wednesday
        { name: 'DM', type: 'Lecture', time: '10:30 TO 11:30' },
        { name: 'ES', type: 'Lecture', time: '11:30 TO 12:30' },
        { name: 'Mentor Mentee Interaction', type: 'MMI', time: '1:00 TO 02:00' },
        { name: 'ADA', type: 'Lecture', time: '02:00 TO 03:00' },
        { lab: true, C1: 'OOP', C2: 'ES', C3: 'COA', C4: 'MATHS', time: '03:15 TO 05:15' }
    ],
    4: [ // Thursday
        { name: 'ADA', type: 'Lecture', time: '10:30 TO 11:30' },
        { name: 'COA', type: 'Lecture', time: '11:30 TO 12:30' },
        { name: 'OOP', type: 'Lecture', time: '1:00 TO 02:00' },
        { name: 'DM', type: 'Lecture', time: '02:00 TO 03:00' },
        { lab: true, C1: 'ADA', C2: 'COA', C3: 'OS', C4: 'OOP', time: '03:15 TO 05:15' }
    ],
    5: [ // Friday
        { lab: true, C1: 'COA', C2: 'ADA', C3: 'OOP', C4: 'ES', time: '10:30 TO 12:30' },
        { name: 'ADA', type: 'Lecture', time: '1:00 TO 02:00' },
        { name: 'OS', type: 'Lecture', time: '02:00 TO 03:00' },
        { name: 'OOP', type: 'Lecture', time: '03:15 TO 04:15' },
        { name: 'ES', type: 'Lecture', time: '04:15 TO 05:15' }
    ]
};

let appState = {
    batch: 'C1',
    attendance: {} // e.g. "2026-04": { "2026-04-01": { isHoliday: false, lectures: { 0: "attended" } } }
};

let currentDate = new Date(); // The absolute today
let selectedDate = new Date(); // The date user is viewing in Home
let calendarMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

// --- Initialization ---
function init() {
    loadData();
    setupNavigation();
    setupHomeListeners();
    setupCalendarListeners();
    setupSettingsListeners();
    
    // Initial renders
    renderSettings();
    renderHome();
}

function loadData() {
    const data = localStorage.getItem('attendanceAppTracker');
    if (data) Object.assign(appState, JSON.parse(data));
}

function saveData() {
    localStorage.setItem('attendanceAppTracker', JSON.stringify(appState));
}

// Helpers
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function formatMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}
function displayDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Ensure day structure exists
function ensureDayData(dateStr, monthStr) {
    if (!appState.attendance[monthStr]) {
        appState.attendance[monthStr] = {};
    }
    if (!appState.attendance[monthStr][dateStr]) {
        appState.attendance[monthStr][dateStr] = { isHoliday: false, lectures: {} };
    }
}

// --- Navigation ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch views
            const targets = document.querySelectorAll('.view');
            targets.forEach(view => view.classList.remove('active'));
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Render view-specific content
            if (targetId === 'view-home') renderHome();
            if (targetId === 'view-calendar') renderCalendar();
            if (targetId === 'view-stats') renderStats();
        });
    });
}

// --- Home View ---
function setupHomeListeners() {
    document.getElementById('prev-day').addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() - 1);
        renderHome();
    });
    document.getElementById('next-day').addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() + 1);
        renderHome();
    });
    document.getElementById('holiday-toggle-btn').addEventListener('click', () => {
        const dStr = formatDate(selectedDate);
        const mStr = formatMonth(selectedDate);
        if(!isClassDay(selectedDate.getDay())) return; // Weekend

        ensureDayData(dStr, mStr);
        const dayData = appState.attendance[mStr][dStr];
        dayData.isHoliday = !dayData.isHoliday;
        
        // if we mark holiday, clear standard manual attendance so it doesn't skew stats unexpectedly
        if(dayData.isHoliday) {
            dayData.lectures = {};
        }

        saveData();
        renderHome();
    });
}

function isClassDay(dayIndex) {
    return dayIndex >= 1 && dayIndex <= 5;
}

function renderHome() {
    document.getElementById('current-date-text').textContent = displayDate(selectedDate);
    
    // Check if weekend
    const dayOfWeek = selectedDate.getDay();
    const dStr = formatDate(selectedDate);
    const mStr = formatMonth(selectedDate);
    const classesList = document.getElementById('classes-list');
    const emptyBanner = document.getElementById('no-classes-banner');
    const holidayBanner = document.getElementById('holiday-banner');
    const holidayToggle = document.getElementById('holiday-toggle-btn');
    
    classesList.innerHTML = '';
    
    if (!isClassDay(dayOfWeek)) {
        emptyBanner.classList.remove('hidden');
        holidayBanner.classList.add('hidden');
        holidayToggle.style.opacity = '0.5';
        holidayToggle.style.pointerEvents = 'none';
        return;
    }

    holidayToggle.style.opacity = '1';
    holidayToggle.style.pointerEvents = 'auto';
    emptyBanner.classList.add('hidden');
    
    ensureDayData(dStr, mStr);
    const dayData = appState.attendance[mStr][dStr];

    if (dayData.isHoliday) {
        holidayBanner.classList.remove('hidden');
        holidayToggle.innerHTML = '<ion-icon name="bed"></ion-icon>'; 
        holidayToggle.style.color = 'var(--primary)';
        // Still render classes but grayed out
        classesList.classList.add('holiday-mode');
    } else {
        holidayBanner.classList.add('hidden');
        holidayToggle.innerHTML = '<ion-icon name="bed-outline"></ion-icon>';
        holidayToggle.style.color = 'var(--text-main)';
        classesList.classList.remove('holiday-mode');
    }

    const classes = timetable[dayOfWeek];
    
    classes.forEach((c, index) => {
        const isLab = c.lab || false;
        const subjName = isLab ? c[appState.batch] : c.name;
        const typeStr = isLab ? 'Lab' : c.type || 'Lecture';
        const currStatus = dayData.lectures[index] || null;

        const el = document.createElement('div');
        el.className = `class-card ${dayData.isHoliday ? 'holiday-mode' : ''}`;
        el.innerHTML = `
            <div class="class-header">
                <div class="class-info">
                    <h3>${subjName}</h3>
                    <p>${c.time}</p>
                </div>
                <span class="class-type">${typeStr}</span>
            </div>
            <div class="class-actions">
                <button class="action-btn attended ${currStatus === 'attended' ? 'selected' : ''}" data-idx="${index}" data-val="attended">
                    <ion-icon name="checkmark-outline"></ion-icon>
                </button>
                <button class="action-btn missed ${currStatus === 'missed' ? 'selected' : ''}" data-idx="${index}" data-val="missed">
                    <ion-icon name="close-outline"></ion-icon>
                </button>
                <button class="action-btn cancelled ${currStatus === 'cancelled' ? 'selected' : ''}" data-idx="${index}" data-val="cancelled">
                    <ion-icon name="remove-circle-outline"></ion-icon>
                </button>
            </div>
        `;
        
        // Add event listeners
        const btns = el.querySelectorAll('.action-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (dayData.isHoliday) return; // Prevent clicks if holiday
                
                const val = btn.getAttribute('data-val');
                const idx = btn.getAttribute('data-idx');
                
                // Toggle logic
                if (dayData.lectures[idx] === val) {
                    delete dayData.lectures[idx];
                } else {
                    dayData.lectures[idx] = val;
                }
                
                saveData();
                renderHome(); // Re-render to update UI
            });
        });

        classesList.appendChild(el);
    });
}

// --- Calendar View ---
function setupCalendarListeners() {
    document.getElementById('prev-month').addEventListener('click', () => {
        calendarMonth.setMonth(calendarMonth.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month').addEventListener('click', () => {
        calendarMonth.setMonth(calendarMonth.getMonth() + 1);
        renderCalendar();
    });
}

function renderCalendar() {
    const monthYearStr = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('calendar-month-text').textContent = monthYearStr;
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const mStr = formatMonth(calendarMonth);

    // Padding for first row
    for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'cal-day empty';
        grid.appendChild(el);
    }

    const todayStr = formatDate(currentDate);

    for (let day = 1; day <= daysInMonth; day++) {
        const checkDate = new Date(year, month, day);
        const dStr = formatDate(checkDate);
        const dayData = appState.attendance[mStr]?.[dStr];

        const el = document.createElement('div');
        el.className = 'cal-day';
        el.textContent = day;

        if (dStr === todayStr) {
            el.classList.add('today');
        }

        if (dStr === formatDate(selectedDate)) {
            el.classList.add('selected');
        }

        if (dayData) {
            if (dayData.isHoliday) {
                el.classList.add('holiday');
            } else if (Object.keys(dayData.lectures).length > 0) {
                el.classList.add('has-data');
            }
        }

        el.addEventListener('click', () => {
            selectedDate = new Date(year, month, day);
            // Switch to Home view automatically and render
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelector('[data-target="view-home"]').classList.add('active');
            
            document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
            document.getElementById('view-home').classList.add('active');
            
            renderHome();
        });

        grid.appendChild(el);
    }
}

// --- Stats View ---
function renderStats() {
    const listSubjects = document.getElementById('stats-subjects');
    const listLabs = document.getElementById('stats-labs');
    listSubjects.innerHTML = '';
    listLabs.innerHTML = '';
    
    // We calculate stats for the currently selected month in calendar / home.
    // Let's use the month of `selectedDate` for the stats (so if user browses to May, they see May stats).
    const mStr = formatMonth(selectedDate);
    const mDisplay = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('stats-month-text').textContent = mDisplay;

    const data = appState.attendance[mStr] || {};
    
    // Counters
    let totAttended = 0;
    let totMissed = 0;
    
    const subjectStats = {};
    const labStats = {};

    // Helper to init subject stat
    const initStat = (dict, name) => {
        if(!dict[name]) dict[name] = { attended: 0, missed: 0 };
    };

    // Iterate over all days in that month
    Object.keys(data).forEach(dStr => {
        const dayData = data[dStr];
        if (dayData.isHoliday) return; // ignore entire day

        const dateObj = new Date(dStr);
        const dayOfWeek = dateObj.getDay();
        const classes = timetable[dayOfWeek] || [];

        Object.keys(dayData.lectures).forEach(idxStr => {
            const idx = parseInt(idxStr);
            const val = dayData.lectures[idx];
            if (val === 'cancelled') return; // ignore cancelled lectures

            const c = classes[idx];
            if (!c) return;

            const isLab = c.lab;
            const name = isLab ? c[appState.batch] : c.name;

            if (isLab) initStat(labStats, name);
            else initStat(subjectStats, name);

            if (val === 'attended') {
                totAttended++;
                if (isLab) labStats[name].attended++;
                else subjectStats[name].attended++;
            } else if (val === 'missed') {
                totMissed++;
                if (isLab) labStats[name].missed++;
                else subjectStats[name].missed++;
            }
        });
    });

    // Overview calculation
    const overallTotal = totAttended + totMissed;
    const overallPerc = overallTotal > 0 ? Math.round((totAttended / overallTotal) * 100) : 0;
    
    document.getElementById('overall-percentage').textContent = overallTotal > 0 ? `${overallPerc}%` : '---';
    const chartOffset = overallTotal > 0 ? overallPerc : 0;
    document.getElementById('overall-chart').style.strokeDasharray = `${chartOffset}, 100`;
    
    // Render subjects
    const renderList = (dict, container) => {
        const sorted = Object.keys(dict).sort();
        if(sorted.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.9rem;">No data</p>';
            return;
        }

        sorted.forEach(name => {
            const item = dict[name];
            const tot = item.attended + item.missed;
            const perc = tot > 0 ? Math.round((item.attended / tot) * 100) : 0;
            
            let color = 'var(--text-main)';
            if(tot > 0) {
                if(perc >= 75) color = 'var(--secondary)';
                else if(perc >= 50) color = 'var(--warning)';
                else color = 'var(--danger)';
            }

            const el = document.createElement('div');
            el.className = 'stat-item';
            el.innerHTML = `
                <div class="stat-item-info">
                    <strong>${name}</strong>
                    <span>${item.attended} / ${tot} attended</span>
                </div>
                <div class="stat-item-value" style="color: ${color}">
                    ${tot > 0 ? perc + '%' : '-'}
                </div>
            `;
            container.appendChild(el);
        });
    };

    renderList(subjectStats, listSubjects);
    renderList(labStats, listLabs);
}

// --- Settings ---
function setupSettingsListeners() {
    const sel = document.getElementById('batch-select');
    sel.addEventListener('change', (e) => {
        appState.batch = e.target.value;
        saveData();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        if(confirm("Are you sure you want to delete all attendance records? This cannot be undone.")) {
            appState.attendance = {};
            saveData();
            alert("All data reset!");
            renderHome();
        }
    });

    document.getElementById('export-btn').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "attendance_tracker_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if(importedData.batch && importedData.attendance) {
                    appState = importedData;
                    saveData();
                    renderSettings();
                    alert("Data imported successfully!");
                } else {
                    alert("Invalid file format.");
                }
            } catch(err) {
                alert("Error reading file.");
            }
        };
        reader.readAsText(file);
    });
}

function renderSettings() {
    document.getElementById('batch-select').value = appState.batch || 'C1';
}

// Start
init();
