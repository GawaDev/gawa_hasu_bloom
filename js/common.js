// common.js

// アプリメニュー
document.addEventListener('DOMContentLoaded', () => {
    const launcher = document.querySelector('.app-launcher');
    const menu = document.querySelector('.app-menu-grid');

    // メニュー開閉処理
    if (launcher && menu) {
        launcher.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.style.display = menu.style.display === 'grid' ? 'none' : 'grid';
        });

        document.addEventListener('click', () => {
            menu.style.display = 'none';
        });
    }

    // 現在のアプリにクラス付与処理
    if (window.currentApp) {
        const selector = `.app-menu-grid .app-grid-item[data-app="${window.currentApp}"]`;
        const currentItem = document.querySelector(selector);
        if (currentItem) {
            currentItem.classList.add('app-grid-current');
        }
    }
});


// レイヤパネルのビルド
function buildLayerPanel(groupId, data) {
    const container = document.querySelector(`#${groupId} .layer-checkboxes`);
    if (!container) return;
    container.innerHTML = "";

    Object.entries(data).forEach(([code, info]) => {
        const wrapper = document.createElement("div");
        wrapper.className = "layer-checkbox";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.code = code; // ← ここでdata属性にコードを持たせる
        input.checked = true;
        input.style.color = info.color;
        input.addEventListener("change", () => {
            const event = new CustomEvent("layerchange", {
                detail: { groupId: groupId }
            });
            window.dispatchEvent(event); // ← 共通イベントとして通知
        });

        const label = document.createElement("label");
        label.textContent = info.name;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
}

function togglePanel(button) {
    const panel = button.closest('.collapsible-panel');
    panel.classList.toggle('collapsed');
}

// 全選択・全解除処理
function toggleAllLayers(groupElement, selectAll) {
    const checkboxes = groupElement.querySelectorAll('.layer-checkboxes input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = selectAll;
    });
    const groupId = groupElement.id;
    const event = new CustomEvent("layerchange", {
        detail: { groupId: groupId }
    });
    window.dispatchEvent(event);
}

function initializeTableFeatures(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const headers = table.querySelectorAll("thead th");
    const tbody = table.querySelector("tbody");

    let sortColumn = -1;
    let sortAsc = true;

    headers.forEach((th, index) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            const rows = Array.from(tbody.querySelectorAll("tr"));
            sortAsc = sortColumn === index ? !sortAsc : true;
            sortColumn = index;
            rows.sort((a, b) => {
                const valA = a.children[index].textContent.trim();
                const valB = b.children[index].textContent.trim();
                return (valA.localeCompare(valB, "ja") || valA - valB) * (sortAsc ? 1 : -1);
            });
            tbody.innerHTML = "";
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}
