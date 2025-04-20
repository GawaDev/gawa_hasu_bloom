// js/maps.js
window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('json/locations.json');
    const data = await response.json();

    const map = L.map('map').setView([35.681236, 139.767125], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const categories = [...new Set(data.map(loc => loc.category))];
    const activeCategories = new Set(categories);

    const layerPanel = document.getElementById('layer-panel');
    const list = document.createElement('div');

    categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'layer-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.dataset.category = category;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                activeCategories.add(category);
            } else {
                activeCategories.delete(category);
            }
            updateMarkers();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(category));
        list.appendChild(label);
    });

    layerPanel.appendChild(list);

    const markers = [];

    function updateMarkers() {
        markers.forEach(m => map.removeLayer(m));
        markers.length = 0;

        data.forEach(loc => {
            if (!activeCategories.has(loc.category)) return;

            const marker = L.marker([loc.lat, loc.lng])
                .addTo(map)
                .bindPopup(`<strong>${loc.name}</strong><br>カテゴリ: ${loc.category}`);
            markers.push(marker);
        });
    }

    updateMarkers();
});