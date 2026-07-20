const socket = io();

// Center roughly on the demo route; adjust to your city if you change routes.js
const map = L.map('map').setView([22.585, 88.38], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// busId -> { marker, updatedAt }
const busMarkers = {};

const busIcon = L.divIcon({
  className: 'bus-div-icon',
  html: '🚌',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

function upsertBus(busId, lat, lng, updatedAt) {
  if (busMarkers[busId]) {
    busMarkers[busId].marker.setLatLng([lat, lng]);
    busMarkers[busId].updatedAt = updatedAt;
  } else {
    const marker = L.marker([lat, lng], { icon: busIcon })
      .addTo(map)
      .bindPopup(busId);
    busMarkers[busId] = { marker, updatedAt };
  }
  renderBusList();
}

function renderBusList() {
  const container = document.getElementById('busList');
  const now = Date.now();
  const ids = Object.keys(busMarkers).sort();

  if (ids.length === 0) {
    container.innerHTML = 'No buses online yet.';
    return;
  }

  container.innerHTML = ids
    .map((id) => {
      const stale = now - busMarkers[id].updatedAt > 8000;
      return `<div class="bus-row"><span class="dot ${stale ? 'stale' : ''}"></span>${id}</div>`;
    })
    .join('');
}

socket.on('initialBuses', (buses) => {
  Object.entries(buses).forEach(([busId, data]) => {
    upsertBus(busId, data.lat, data.lng, data.updatedAt);
  });

  if (Object.keys(buses).length > 0) {
    const group = L.featureGroup(Object.values(busMarkers).map((b) => b.marker));
    map.fitBounds(group.getBounds().pad(0.3));
  }
});

socket.on('busLocationUpdate', ({ busId, lat, lng, updatedAt }) => {
  upsertBus(busId, lat, lng, updatedAt);
});

// Refresh the "stale" indicator every few seconds even without new data.
setInterval(renderBusList, 3000);
