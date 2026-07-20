const socket = io();

const busIdInput = document.getElementById('busId');
const toggleBtn = document.getElementById('toggleBtn');
const statusEl = document.getElementById('driverStatus');

let watchId = null;
let sharing = false;

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type || '';
}

function startSharing() {
  const busId = busIdInput.value.trim();

  if (!busId) {
    setStatus('please enter a Bus ID (e.g, Bus-3).', 'error');
    return;
  }

  if (!('geolocation' in navigator)) {
    setStatus('This browser does not support Geolocation.', 'error');
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit('driverLocationUpdate', { busId, lat: latitude, lng: longitude });
      setStatus(
        `Sharing live location for ${busId}\nLat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
        'ok'
      );
    },
    (error) => {
      setStatus(`Location error: ${error.message}`, 'error');
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000
    }
  );

  sharing = true;
  busIdInput.disabled = true;
  toggleBtn.textContent = 'Stop Sharing';
  toggleBtn.classList.add('sharing');
}

function stopSharing() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  sharing = false;
  busIdInput.disabled = false;
  toggleBtn.textContent = 'Start Sharing My GPS Location';
  toggleBtn.classList.remove('sharing');
  setStatus('Sharing stopped.', '');
}

toggleBtn.addEventListener('click', () => {
  if (sharing) {
    stopSharing();
  } else {
    startSharing();
  }
});
