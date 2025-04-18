// Ime Data
// 自動生成されたレイヤグループのリストを抽出してパネルを構築するための形式

const imeData = [];

// 読み込みと初期化
window.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("json/ime.json");
    imeData = await res.json();
    renderLayerPanel();
    renderWordList();

    document.querySelector("#dynamic-layer-panel").addEventListener("change", renderWordList);
});

// レイヤ一覧をユニークに取得
const getUniqueGroupNames = () => {
    const seen = new Set();
    const result = [];
    for (const item of imeData) {
        if (!seen.has(item.groupName)) {
            seen.add(item.groupName);
            result.push({ group: item.group, groupName: item.groupName });
        }
    }
    return result;
};

// レイヤパネルを動的生成
const renderLayerPanel = () => {
    const container = document.querySelector("#dynamic-layer-panel");
    container.innerHTML = "";

    const uniqueGroups = getUniqueGroupNames();

    for (const { group, groupName } of uniqueGroups) {
        const checkbox = document.createElement("div");
        checkbox.className = "layer-checkbox";
        checkbox.innerHTML = `
        <input type="checkbox" class="layer" value="${group}" data-code="${group}" checked>
        ${groupName}
      `;
        container.appendChild(checkbox);
    }
};

// フィルタ適用後の語句リストを表示
const renderWordList = () => {
    const tbody = document.querySelector("#word-list");
    tbody.innerHTML = "";

    const selectedGroups = Array.from(document.querySelectorAll(".layer:checked"))
        .map(cb => Number(cb.dataset.code));

    const filtered = imeData.filter(word => selectedGroups.includes(word.group));

    for (const word of filtered) {
        const tr = document.createElement("tr");

        const tdCheck = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.value = `${word.reading}\t${word.surface}\t${word.pos}`;
        tdCheck.appendChild(checkbox);

        const tdSurface = document.createElement("td");
        tdSurface.textContent = word.surface;

        const tdReading = document.createElement("td");
        tdReading.textContent = word.reading;

        const tdPos = document.createElement("td");
        tdPos.textContent = word.pos;

        const tdComment = document.createElement("td");
        tdComment.textContent = word.comment;

        tr.appendChild(tdCheck);
        tr.appendChild(tdSurface);
        tr.appendChild(tdReading);
        tr.appendChild(tdPos);
        tr.appendChild(tdComment);

        tbody.appendChild(tr);
    }
};

// プレビュー表示
function previewOutput() {
    document.querySelector("#preview").textContent = buildOutput();
    document.querySelector("#preview-modal").classList.remove("hidden");
}

function closeModal() {
    document.querySelector("#preview-modal").classList.add("hidden");
}

function buildOutput() {
    const format = document.getElementById("format").value;
    const lines = Array.from(document.querySelectorAll("#word-list input[type=checkbox]:checked"))
        .map(cb => cb.value);

    switch (format) {
        case "msime":
            return lines.map(line => line.replace(/\t/g, ",")).join("\n");
        case "google":
            return lines.map(line => line + "\t名詞").join("\n");
        case "skk":
        default:
            return lines.join("\n");
    }
}

function downloadOutput() {
    const blob = new Blob([buildOutput()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ime_dict.txt";
    a.click();
    URL.revokeObjectURL(url);
}
