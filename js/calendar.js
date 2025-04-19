// script.js - Bloom Calendar 専用スクリプト

let onsite_events = [];
let streaming_events = [];
let contents = {};
let locations = {};
let holidays = [];
let persons = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

window.onload = async function () {
    try {
        const [onsiteRes, streamingRes, contentsRes, locationsRes, holidaysRes, personsRes] = await Promise.all([
            fetch('json/onsite_events.json'),
            fetch('json/streaming_events.json'),
            fetch('json/contents.json'),
            fetch('json/locations.json'),
            fetch('json/holidays.json'),
            fetch('json/persons.json')
        ]);

        onsite_events = await onsiteRes.json();
        streaming_events = await streamingRes.json();
        contents = await contentsRes.json();
        locations = await locationsRes.json();
        holidays = await holidaysRes.json();
        persons = await personsRes.json();

        buildLayerPanel("contents-layer-group", contents);
        // buildLayerPanel("event-layer-group", event);
        const { month, year } = getMonthYearFromURL();
        currentMonth = month;
        currentYear = year;
        createCalendar(currentYear, currentMonth);
    } catch (error) {
        console.error("データの読み込みに失敗しました", error);
    }
};

document.getElementById("prev-month").addEventListener("click", () => {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    updateCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    updateCalendar();
});

// イベントリスナーを使って反応させる（レイヤーチェックボックス用）
window.addEventListener("layerchange", (e) => {
    updateCalendar();
});

document.querySelector(".close-button").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal")) {
        document.getElementById("modal").style.display = "none";
    }
});

function getMonthYearFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        month: params.get("month") ? parseInt(params.get("month")) - 1 : new Date().getMonth(),
        year: params.get("year") ? parseInt(params.get("year")) : new Date().getFullYear()
    };
}

function updateCalendar() {
    createCalendar(currentYear, currentMonth);
    window.history.replaceState({}, '', `?month=${currentMonth + 1}&year=${currentYear}`);
}

function combineAndFilterEvents() {
    const container = document.querySelector("#contents-layer-group .layer-checkboxes");
    const active = [];

    if (container) {
        container.querySelectorAll("input[type='checkbox']").forEach(cb => {
            if (cb.checked) {
                active.push(cb.dataset.code); // ← data-codeを使うように修正
            }
        });
    }

    const all = [...onsite_events, ...streaming_events];
    return all.filter(ev => ev.content_codes.some(code => active.includes(code)))
        .sort((a, b) => new Date(a.date + 'T' + a.start_time) - new Date(b.date + 'T' + b.start_time));
}


function createCalendar(year, month) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";
    document.getElementById("calendar-year").textContent = `${year}年`;
    document.getElementById("calendar-month").textContent = `${month + 1}月`;

    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    weekdays.forEach((day, i) => {
        const cell = document.createElement("div");
        cell.className = `calendar-weekday ${i === 0 ? 'sunday' : i === 6 ? 'saturday' : ''}`;
        cell.textContent = day;
        calendar.appendChild(cell);
    });

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const today = new Date();
    const start = first.getDay();
    const days = last.getDate();
    const events = combineAndFilterEvents();

    for (let i = 0; i < start; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        calendar.appendChild(empty);
    }

    for (let date = 1; date <= days; date++) {
        const d = new Date(year, month, date);
        const cell = document.createElement("div");
        const wday = d.getDay();
        cell.className = `calendar-day ${wday === 0 ? 'sunday' : wday === 6 ? 'saturday' : ''}`;
        if (d.toDateString() === today.toDateString()) cell.classList.add("today");

        cell.innerHTML = `<div class="date">${date}</div>`;

        holidays.forEach(h => {
            if (new Date(h.date).toDateString() === d.toDateString()) {
                cell.classList.add("holiday");
                const tag = document.createElement("span");
                tag.className = "holiday-name";
                tag.textContent = h.name;
                cell.querySelector(".date").appendChild(tag);
            }
        });

        persons.forEach(p => {
            if (p.birth_month === month + 1 && p.birth_day === date) {
                const b = document.createElement("div");
                b.className = "birthday";
                b.innerHTML = `<span class="birthday-dot" style="color: ${p.color};">●</span> ${p.name}の誕生日`;
                cell.appendChild(b);
            }
        });

        events.forEach(ev => {
            if (new Date(ev.date).toDateString() === d.toDateString()) {
                cell.appendChild(createEventDiv(ev));
            }
        });

        calendar.appendChild(cell);
    }
}

function createEventDiv(ev) {
    const div = document.createElement("div");
    div.className = "event";

    const colors = ev.content_codes.map(code => contents[code]?.color).filter(Boolean);
    if (colors.length === 1) div.style.backgroundColor = colors[0];
    else if (colors.length > 1) div.style.backgroundImage = `linear-gradient(135deg, ${colors.join(', ')})`;
    else div.style.backgroundColor = '#ccc';

    const location = Array.isArray(ev.location_code)
        ? ev.location_code.map(c => locations[c]?.name).filter(Boolean).join(', ')
        : locations[ev.location_code]?.name || '';

    const time = ev.start_time && ev.end_time
        ? `${ev.start_time} - ${ev.end_time}`
        : ev.start_time
            ? `${ev.start_time} -`
            : ev.end_time
                ? `- ${ev.end_time}`
                : '';

    div.innerHTML = `
    ${time ? `<span class="event-time">${time}</span>` : ''}
    <span class="event-title">${ev.name}</span>
    <span class="event-location">${location ? '＠' + location : ''}</span>
  `;

    div.addEventListener("click", () => {
        const contentLabels = ev.content_codes.map(code => {
            const c = contents[code];
            return `<div class="content-label" style="background-color:${c?.color || '#999'}">${c?.name || '不明'}</div>`;
        }).join('');

        const modalContent = `
      ${contentLabels}
      <h2>${ev.name}</h2>
      <table class="modal-table">
        <tr><td class="label">日付</td><td class="value">${ev.date}</td></tr>
        <tr><td class="label">時刻</td><td class="value">${time || '-'}</td></tr>
        <tr><td class="label">場所</td><td class="value">${location || '-'}</td></tr>
        <tr><td class="label">ウェブサイト</td><td class="value">${ev.websites?.map(url => `<a href="${url}" target="_blank">${url}</a>`).join('<br>') || '-'}</td></tr>
      </table>
    `;

        document.getElementById("modal-body").innerHTML = modalContent;
        document.getElementById("modal").style.display = "block";
    });

    return div;
}
