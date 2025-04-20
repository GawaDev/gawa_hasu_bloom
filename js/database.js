// js/database.js

const datasets = [
    'ime.json',
    'onsite_events.json',
    'streaming_events.json',
    'locations.json',
    'persons.json',
    'goods_events.json',
    'holidays.json',
    'contents.json'
];

window.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('dataset-select');
    const table = document.getElementById('database-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    datasets.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name.replace('.json', '');
        select.appendChild(option);
    });

    select.addEventListener('change', async () => {
        const file = select.value;
        try {
            const res = await fetch(`json/${file}`);
            const data = await res.json();
            renderTable(data);
        } catch (err) {
            console.error(`読み込みエラー: ${file}`, err);
            thead.innerHTML = '<tr><th>読み込み失敗</th></tr>';
            tbody.innerHTML = '';
        }
    });

    function renderTable(data) {
        thead.innerHTML = '';
        tbody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) return;

        const keys = Object.keys(data[0]);
        const headRow = document.createElement('tr');
        keys.forEach(k => {
            const th = document.createElement('th');
            th.textContent = k;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);

        data.forEach(row => {
            const tr = document.createElement('tr');
            keys.forEach(k => {
                const td = document.createElement('td');
                td.innerHTML = formatValue(row[k]);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    function isColorCode(value) {
        return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
    }

    function isDateString(value) {
        return typeof value === 'string' && /\d{4}-\d{2}-\d{2}/.test(value);
    }

    function isTimeString(value) {
        return typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);
    }

    function isURL(value) {
        try {
            const url = new URL(value);
            return url.protocol.startsWith('http');
        } catch (_) {
            return false;
        }
    }

    function formatValue(value) {
        if (Array.isArray(value)) {
            return value.map(formatValue).join('<br>');
        } else if (isColorCode(value)) {
            return `<span style="background:${value};padding:2px 6px;border-radius:4px;color:#fff">${value}</span>`;
        } else if (isDateString(value)) {
            return value;
        } else if (isURL(value)) {
            return `<a href="${value}" target="_blank">${value}</a>`;
        }
        return value;
    }

    select.value = 'ime.json';
    select.dispatchEvent(new Event('change'));
});
