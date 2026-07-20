# 🚌 Bus Tracking System (GPS + Real-time Map)

A real-time bus tracking system that shows live bus locations on a browser map using GPS data.

## Features

- 🗺️ Live map view powered by Leaflet.js + OpenStreetMap (no API key required)
- 📡 Real-time updates over WebSockets (Socket.io)
- 🎨 Each bus automatically gets its own distinct color, consistent across the map and the bus list
- 🧪 Built-in simulated buses (`Bus-1`, `Bus-2`) that move automatically — no hardware needed to demo
- 📱 Driver mode — share a real phone/laptop's GPS location as a live bus using the browser's Geolocation API
- 🟢 Online/offline status indicator for each bus in the sidebar list

## Tech Stack

- **Backend:** Node.js, Express, Socket.io
- **Frontend:** HTML, CSS, JavaScript, Leaflet.js
- **Real-time communication:** WebSocket (Socket.io)

## Project Structure

```
bus-tracking-system/
├── server.js          # Backend server + GPS simulation + socket events
├── package.json
├── public/
│   ├── index.html     # Passenger view — shows all buses on the map
│   ├── driver.html    # Driver view — sends a real device's GPS location
│   ├── script.js      # Map rendering + live marker update logic
│   ├── driver.js       # Geolocation API logic for sending GPS updates
│   └── style.css
```

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org) v18 or higher

Check your version:
```bash
node -v
npm -v
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the server

```bash
npm start
```

You should see:
```
Bus Tracking Server running at http://localhost:3000
```

### 4. Open the passenger view

Go to **http://localhost:3000** in your browser. You'll see two simulated buses (`Bus-1`, `Bus-2`) moving automatically, with their position updating every 2 seconds.

### 5. Try driver mode (share real GPS)

- Open **http://localhost:3000/driver.html** on any phone or laptop
- Enter a Bus ID (e.g. `Bus-3`)
- Click **"Start Sharing My GPS Location"**
- Allow the location permission prompt
- Go back to the passenger view (`index.html`) — that bus now shows its real, live GPS position

> To test across devices on the same WiFi network, use your machine's local IP instead of `localhost` (e.g. `http://192.168.x.x:3000`). Note that the Geolocation API only works over `localhost` or HTTPS, so testing from another phone typically needs HTTPS (this is handled automatically once deployed).

## Customizing for Your Own City/Route

Edit the `routes` object in `server.js` with real lat/lng coordinates for your city:

```js
const routes = {
  "Bus-1": [
    { lat: 22.5726, lng: 88.3639 },
    // ...more waypoints
  ],
};
```

Tip: right-click any location on Google Maps to copy its lat/lng.

## How Bus Colors Work

Each bus is automatically assigned a color from a fixed palette based on a hash of its Bus ID (see `colorForBus()` in `public/script.js`). This means the same Bus ID always renders in the same color, both on the map marker and in the sidebar list — no manual configuration needed.

## Possible Next Steps

- ETA calculation (distance / average speed)
- Persist location history with SQLite/MongoDB
- Draw a bus route as a polyline on the map
- Student login to track only their own bus
- Deploy for free on Render or Railway

## Deployment

This app can be deployed for free on [Render](https://render.com) or [Railway](https://railway.app) — push the repo to GitHub and connect it there.

## License

MIT
