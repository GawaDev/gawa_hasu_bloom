// apps.js - トップページ用 今日のスケジュールのみ表示

let onsite_events = [];
let streaming_events = [];
let contents = {};
let locations = {};

window.addEventListener('DOMContentLoaded', async function () {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const scheduleList = document.getElementById("today-schedule-list");
    if (!scheduleList) return;

    try {
        // 必要なJSONのみ読み込み
        const [onsiteRes, streamingRes, contentsRes, locationsRes] = await Promise.all([
            fetch('json/onsite_events.json'),
            fetch('json/streaming_events.json'),
            fetch('json/contents.json'),
            fetch('json/locations.json')
        ]);
        onsite_events = await onsiteRes.json();
        streaming_events = await streamingRes.json();
        contents = await contentsRes.json();
        locations = await locationsRes.json();

        // 今日のイベントのみ抽出
        const events = [...onsite_events, ...streaming_events]
            .filter(ev => ev.date === todayStr)
            .sort((a, b) => {
                // 開始時刻でソート
                if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
                if (a.start_time) return -1;
                if (b.start_time) return 1;
                return 0;
            });

        if (events.length === 0) {
            scheduleList.innerHTML = `<div class='schedule-none'>本日の予定はありません。</div>`;
        } else {
            scheduleList.innerHTML = events.map(ev => {
                // 内容名ラベル・色
                const labels = (ev.content_codes || []).map(code => {
                    const c = contents[code];
                    return c
                        ? `<span class="content-label" style="background-color:${c.color};color:#fff;padding:2px 6px;border-radius:8px;font-size:0.9em;margin-right:4px;">${c.name}</span>`
                        : "";
                }).join('');

                // 場所
                let locationName = "";
                if (ev.location_code) {
                    if (Array.isArray(ev.location_code)) {
                        locationName = ev.location_code.map(c => locations[c]?.name).filter(Boolean).join("・");
                    } else {
                        locationName = locations[ev.location_code]?.name || "";
                    }
                }

                // 時刻
                let timeStr = "";
                if (ev.start_time && ev.end_time) timeStr = `${ev.start_time}～${ev.end_time}`;
                else if (ev.start_time) timeStr = `${ev.start_time}～`;
                else if (ev.end_time) timeStr = `～${ev.end_time}`;

                return `
                    <div class="schedule-card" style="margin-bottom:10px;padding:10px;border-radius:8px;background:#faf8fb;box-shadow:0 2px 8px #eee;">
                        <div style="margin-bottom:4px;">${labels}</div>
                        <div class="event-title" style="font-weight:bold;font-size:1.05em;margin-bottom:2px;">${ev.name || ev.title || ''}</div>
                        ${timeStr ? `<div class="event-time" style="font-size:0.95em;color:#888;">${timeStr}</div>` : ""}
                        ${locationName ? `<div class="event-location" style="font-size:0.95em;color:#888;">＠${locationName}</div>` : ""}
                    </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error(e);
        scheduleList.innerHTML = `<div class='schedule-error'>予定を取得できませんでした。</div>`;
    }
});
