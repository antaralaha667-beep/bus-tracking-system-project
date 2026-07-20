const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------------------------------------
// Simulated bus routes.
// Replace these lat/lng waypoints with real coordinates for your city.
// Right-click any spot on Google Maps to copy its lat/lng.
// ------------------------------------------------------------------
const routes = {
  'Bus-1': [
    { lat: 22.5726, lng: 88.3639 }, // Kolkata
    { lat: 22.5750, lng: 88.3700 },
    { lat: 22.5790, lng: 88.3760 },
    { lat: 22.5830, lng: 88.3820 },
    { lat: 22.5870, lng: 88.3880 },
    { lat: 22.5910, lng: 88.3940 },
    { lat: 22.5870, lng: 88.3880 },
    { lat: 22.5830, lng: 88.3820 },
    { lat: 22.5790, lng: 88.3760 },
    { lat: 22.5750, lng: 88.3700 }
  ],
  'Bus-2': [
    { lat: 22.6000, lng: 88.4000 },
    { lat: 22.6040, lng: 88.3950 },
    { lat: 22.6080, lng: 88.3900 },
    { lat: 22.6120, lng: 88.3850 },
    { lat: 22.6160, lng: 88.3800 },
    { lat: 22.6120, lng: 88.3850 },
    { lat: 22.6080, lng: 88.3900 },
    { lat: 22.6040, lng: 88.3950 }
  ]
};

// In-memory state of every bus currently being tracked (simulated + real).
// Shape: { busId: { lat, lng, updatedAt, source } }
const buses = {};

// Initialise simulated buses and set up their step index.
const simState = {};
Object.keys(routes).forEach((busId) => {
  simState[busId] = { index: 0 };
  const start = routes[busId][0];
  buses[busId] = {
    lat: start.lat,
    lng: start.lng,
    updatedAt: Date.now(),
    source: 'simulated'
  };
});

// Move every simulated bus one step along its route every 2 seconds
// and broadcast the update to all connected clients.
setInterval(() => {
  Object.keys(routes).forEach((busId) => {
    const route = routes[busId];
    const state = simState[busId];
    state.index = (state.index + 1) % route.length;
    const point = route[state.index];

    buses[busId] = {
      lat: point.lat,
      lng: point.lng,
      updatedAt: Date.now(),
      source: 'simulated'
    };

    io.emit('busLocationUpdate', { busId, ...buses[busId] });
  });
}, 2000);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send the current snapshot of every known bus to the newly connected client.
  socket.emit('initialBuses', buses);

  // A driver page sends real GPS coordinates from a phone/laptop.
  socket.on('driverLocationUpdate', ({ busId, lat, lng }) => {
    if (!busId || typeof lat !== 'number' || typeof lng !== 'number') return;

    buses[busId] = {
      lat,
      lng,
      updatedAt: Date.now(),
      source: 'live'
    };

    io.emit('busLocationUpdate', { busId, ...buses[busId] });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Bus Tracking Server running at http://localhost:${PORT}`);
});
