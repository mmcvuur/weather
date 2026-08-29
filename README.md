# 🌦️ iOS Weather App Clone

An authentic, feature-packed Progressive Web App (PWA) recreating the native Apple iOS Weather experience in modern browsers. Built with pure Vanilla JavaScript, CSS glassmorphism, dynamic HTML5 canvas weather effects, and powered by open APIs—with zero build step or heavy dependencies.

---

## ✨ Features

### 🎨 Authentic iOS Design & Micro-Interactions
- **Glassmorphic UI**: High-fidelity translucent frosted cards, depth layering, smooth transitions, and Apple SF Pro typography.
- **Adaptive Day / Night Themes**: Ambient gradient backgrounds shift smoothly based on local solar time and current weather conditions.
- **Mobile-First & Desktop Frame**: Responsive layout that renders as an edge-to-edge mobile app on smartphones and an elegant iPhone-framed container on desktop screens.
- **Pull-to-Refresh**: Native touch-enabled pull-down gesture to refresh current weather data with animated status indicators.

### 🌧️ Dynamic Weather Particle Canvas
- Custom-built, lightweight 2D HTML5 Canvas particle engine rendering real-time atmospheric visual effects:
  - **Rain & Downpours**: Angled rain streaks with variable velocities.
  - **Thunderstorms**: Random lightning flash illumination effects.
  - **Snowfall**: Soft fluttering snowflakes with sine-wave sway.
  - **Fog / Mist**: Drifting low-opacity radial gradient mist particles.
  - **Starry Night**: Twinkling stars on clear nocturnal skies.
- Automatically pauses during tab inactivity via Page Visibility API to save battery and GPU cycles.

### 🤖 AI Weather Summary
- Synthesizes complex multi-dimensional meteorological data into a friendly natural-language forecast summary:
  - 12-hour precipitation windows and peak probabilities.
  - Day high/low temperature outlook and thermal comfort ("feels like" adjustments).
  - High wind gust alerts and UV index warnings.
  - Actionable advice badges (e.g., *Bring Umbrella*, *Dress Warm*, *High UV / Wear Sunscreen*, *Optimal Running Weather*).

### 🛰️ Live Precipitation Radar Map
- Integrated interactive radar viewer powered by **Leaflet** and **LibreWXR API** (with RainViewer fallback):
  - Live animated past and nowcast radar tile overlays.
  - Playback controls with timeline frame stepping and reset to live view.
  - **Fullscreen Radar View**: Expandable modal map with smooth panning and GPS location recentering.
  - Base tiles styled with Esri World Dark Gray Canvas for dark iOS aesthetics (with optional CARTO Dark Matter key support).

### 📊 Comprehensive Weather Data & Forecasts
- **Current Conditions**: Temperature, high/low range, condition description, and WMO weather icons.
- **Hourly Forecast**: 24-hour horizontal scrolling forecast with temperature trend curves, precipitation probabilities, and solar sunrise/sunset markers.
- **10-Day Forecast**: Multi-day outlook with condition icons and normalized temperature range gradient bars.
- **Wind Compass**: Custom SVG analog compass showing live wind direction, wind speed, and gust metrics.
- **Air Quality Index (AQI)**: US AQI rating, European AQI, PM2.5, PM10 metrics, and an iOS-style colored spectrum indicator with health advisories.
- **Detailed Metrics Grid**:
  - 🌅 Sunrise & Sunset times with dynamic solar countdown
  - 💧 Humidity & Dew Point calculation
  - ☀️ UV Index with risk classification
  - 👁️ Visibility distance in kilometers/miles
  - 🧭 Surface Barometric Pressure in hPa
  - 🌡️ Apparent ("Feels Like") Temperature

### 📍 Location Management & Geocoding
- **GPS Auto-Detection**: Instant device geolocation with reverse geocoding to city/neighborhood names.
- **City Search & Autocomplete**: Real-time debounce search for global cities and regions.
- **Saved Locations Drawer**: Manage multiple saved cities with one-tap switching and deletion.
- **Unit Conversion**: Seamless instant toggle between Metric (°C, km/h) and Imperial (°F, mph).

### 📱 Progressive Web App (PWA) & Offline Support
- **Installable**: Full Web App Manifest support with standalone mode and custom high-res icons for iOS Home Screen, Android, and Desktop.
- **Service Worker Caching**: Offline caching strategy allowing instant launches even without network connectivity.
- **Cache Status Indicator**: Visual notification badge when viewing cached or offline meteorological data.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies / Sources |
|---|---|
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, Vanilla CSS3 (Glassmorphism, Flexbox, CSS Grid) |
| **Graphics Engine** | HTML5 Canvas 2D API (Dynamic Weather Particles) |
| **Mapping & Radar** | Leaflet.js, LibreWXR Radar API (RainViewer fallback), Esri World Dark Gray Canvas |
| **Weather Data API** | [Open-Meteo Weather Forecast API](https://open-meteo.com/) (No API key required) |
| **Air Quality API** | [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) |
| **Geocoding API** | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) |
| **Reverse Geocoding** | [BigDataCloud Reverse Geocoding API](https://api-bdc.io/) |
| **Storage & PWA** | Service Worker API, Cache Storage API, LocalStorage, Web App Manifest |

---

## 📁 Project Structure

```text
.
├── index.html           # Main HTML structure, layout templates, and modal drawers
├── styles.css           # iOS-inspired styling, glassmorphism tokens, and responsive rules
├── app.js               # Application logic, state, APIs, particle engine, and UI rendering
├── sw.js                # Service Worker for asset caching and offline resilience
├── bump-version.js      # Utility script for semantic versioning & cache timestamp updates
├── manifest.json        # PWA configuration and metadata
├── favicon.ico          # Legacy ICO favicon
├── favicon.svg          # Vector favicon
├── favicon.png          # PNG favicon
├── icon-192.png         # PWA icon (192x192)
├── icon-512.png         # PWA icon (512x512)
├── apple-touch-icon.png # Apple touch icon for iOS Home Screen
├── robots.txt           # Crawler instructions
└── LICENSE              # MIT License
```

---

## 🚀 Getting Started

No build tools, bundlers, or package installations are required!

### 1. Clone the repository
```bash
git clone https://codeberg.org/mmcvuur/weather.git
cd weather
```

### 2. Run with any local HTTP server
Because the app uses modern Web APIs (Service Workers and Geolocation), it is best served over HTTP/HTTPS rather than opened directly as a `file://` URL.

**Using Python:**
```bash
python3 -m http.server 8080
```

**Using Node.js (`npx serve` or `http-server`):**
```bash
npx serve .
```

**Using VS Code:**
- Install the **Live Server** extension and click **Go Live**.

Open your browser and navigate to:
```
http://localhost:8080
```

---

## 📲 Installing as a PWA

### On iOS (Safari):
1. Open the app URL in Safari.
2. Tap the **Share** icon (square with arrow up).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top-right corner.

### On Android (Chrome):
1. Open the app URL in Chrome.
2. Tap the **Three Dots (⋮)** menu in the top-right corner.
3. Tap **Install app** or **Add to Home screen**.

---

## 🏷️ Version Management

A helper script is included to increment the semantic application version and update the Service Worker cache identifier:

```bash
# Bump patch version (e.g., v2.4.4 -> v2.4.5)
node bump-version.js patch

# Bump minor version (e.g., v2.4.4 -> v2.5.0)
node bump-version.js minor

# Bump major version (e.g., v2.4.4 -> v3.0.0)
node bump-version.js major
```

This automatically:
1. Updates the `SW_VERSION` timestamp in [sw.js](file:///Users/mmcvuur/CODE/PROJECTS/weather/sw.js) to bust stale cache buckets on client devices.
2. Updates the visible version badge in [index.html](file:///Users/mmcvuur/CODE/PROJECTS/weather/index.html).

---

## 🔒 Privacy & Open Data

- **Zero Tracking**: No telemetry, analytics, or user tracking.
- **Open Data**: Powered by Open-Meteo and LibreWXR public weather infrastructure.
- **Local Storage**: Location history and unit preferences are stored exclusively on your device.

---

## 📄 License

This project is open-source software licensed under the [MIT License](file:///Users/mmcvuur/CODE/PROJECTS/weather/LICENSE).
