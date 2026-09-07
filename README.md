# 🌦️ iOS Weather App Clone

An authentic, feature-packed Progressive Web App (PWA) recreating the native Apple iOS Weather experience in modern browsers. Built with pure Vanilla JavaScript, CSS glassmorphism, dynamic HTML5 canvas weather effects, and powered by open APIs—with zero build step or heavy dependencies.

---

## ✨ Features

### 🎨 Authentic iOS Design & Micro-Interactions
- **Glassmorphic UI & Typography**: High-fidelity translucent frosted cards, depth layering, smooth transitions, and a crisp **JetBrains Mono** monospace typographic hierarchy (with bold metrics, italic conditions and subtitles, and extra-light hero temperature).
- **Adaptive Day / Night Themes**: Ambient gradient backgrounds shift smoothly based on local solar time and current weather conditions.
- **Mobile-First & Desktop Frame**: Responsive layout that renders as an edge-to-edge mobile app on smartphones and an elegant iPhone-framed container on desktop screens.
- **Dynamic Browser Tab**: Automatically updates the tab title with the active city name and current temperature (e.g., `Amsterdam 22°`).
- **Pull-to-Refresh & Auto-Reload**: Native touch-enabled pull-down gesture and automated 10-minute background reload timer (with Page Visibility & network recovery checks) to keep forecasts continually updated.

### 🌧️ Dynamic Weather Particle Canvas
- Custom-built, high-performance 2D HTML5 Canvas particle engine rendering real-time atmospheric visual effects:
  - **Rain, Drizzle & Downpours**: Angled rain streaks with variable velocities and intensities.
  - **Thunderstorms & Lightning**: Random ambient lightning flash illumination and dark atmospheric cloud veils.
  - **Thundersnow**: Combined swirling winter snowflakes with intermittent lightning flash illumination.
  - **Snowfall & Blowing Snow**: Soft fluttering snowflakes with sine-wave sway and wind-driven horizontal blizzard drift.
  - **Sleet & Mixed Precipitation**: Combined rainfall streaks and bouncing translucent sleet/ice beads.
  - **Hail & Ice Pellets**: Fast-falling bouncing hail pellets paired with severe thunderstorm precipitation.
  - **Fog & Mist**: Drifting low-opacity radial gradient mist particles and atmospheric haze.
  - **Dust & Sandstorms**: Sweeping warm ochre and cool dust particles propelled horizontally by wind.
  - **Virga / Distant Precipitation**: High-altitude precipitation streaks evaporating before reaching ground level.
  - **High Winds & Squalls**: Dynamic aerodynamic wind gust wisps streaming across the screen at high velocities.
  - **Overcast & Cloud Banks**: Diffused atmospheric top haze and layered, slow-drifting overcast cloud banks with parallax depth and gentle breathing opacity pulses.
  - **Partly Cloudy**: Soft drifting cumulus cloud banks paired with daylight sun motes or nocturnal stars.
  - **Clear Blue Sky**: Ambient solar glow, gentle drifting sunbeams, and floating sunlight dust motes.
  - **Starry Night**: Twinkling starfield across clear nocturnal skies.
- Automatically pauses during tab inactivity via the Page Visibility API to conserve battery and GPU cycles.

### 🤖 AI Weather Summary
- Synthesizes complex multi-dimensional meteorological data into a friendly natural-language forecast summary:
  - 12-hour precipitation windows and peak probabilities.
  - Day high/low temperature outlook and thermal comfort ("feels like" adjustments).
  - High wind gust alerts and UV index warnings.
  - **Actionable Recommendation Badges**: Dynamic chips for smart advice (e.g., *Rain Expected*, *Bring Umbrella*, *Dress Warmly*, *Layer Up*, *High UV / Use SPF*, *Sunglasses Recommended*, *Breezy*, *Great Outdoor Conditions*).
  - One-tap re-analyze refresh button with animated feedback.

### 🛰️ Live Precipitation Radar Map
- Integrated interactive radar viewer powered by **Leaflet** and **LibreWXR API** (with RainViewer fallback):
  - Live animated past and nowcast radar tile overlays.
  - Playback controls with timeline frame stepping and reset to live view.
  - **Fullscreen Radar View**: Expandable modal map with smooth panning and GPS location recentering.
  - Base tiles styled with CARTO Dark Matter for dark iOS aesthetics.

### 📊 Comprehensive Weather Data & Forecasts
- **Current Conditions**: Temperature, high/low range, condition description, and WMO weather icons (with day/night variants).
- **Hourly Forecast**: 24-hour horizontal scrolling forecast with centered temperatures, precipitation probabilities, and solar sunrise/sunset markers.
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
- **City Search & Autocomplete**: Real-time debounce search for global cities and regions via Open-Meteo Geocoding API.
- **Saved Locations Drawer**: Manage multiple saved cities with one-tap switching and deletion.
- **Unit Conversion**: Seamless instant toggle between Metric (°C, km/h) and Imperial (°F, mph).

### 📱 Progressive Web App (PWA) & Offline Support
- **Installable**: Full Web App Manifest support with standalone mode and custom high-res icons for iOS Home Screen, Android, and Desktop.
- **Local Font Assets**: 100% self-hosted JetBrains Mono font files (all weights: Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, and variable font files) cached offline with zero third-party font network dependencies.
- **Service Worker Caching**: Offline caching strategy allowing instant launches even without network connectivity.
- **Cache Status Indicator**: Visual notification badge when viewing cached or offline meteorological data.
- **Console Events & VarVal Engine**: Structured real-time event telemetry system featuring color-coded theme badges (cyan for lifecycle & storage, purple for canvas & AI, green for success, amber for warnings, red for errors) and formatted `var=val` variable-value pairs for all lifecycle events, API fetches, geolocation updates, particle canvas animations, and UI interactions.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies / Sources |
|---|---|
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, Vanilla CSS3 (Glassmorphism, Flexbox, CSS Grid) |
| **Typography** | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (Self-hosted variable & static WOFF2 webfonts) |
| **Graphics Engine** | HTML5 Canvas 2D API (Dynamic Weather Particles) |
| **Mapping & Radar** | Leaflet.js, LibreWXR Radar API (RainViewer fallback), CARTO Dark Matter Tiles |
| **Weather Data API** | [Open-Meteo Weather Forecast API](https://open-meteo.com/) (No API key required) |
| **Air Quality API** | [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) |
| **Geocoding API** | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) |
| **Reverse Geocoding** | [BigDataCloud Reverse Geocoding API](https://api-bdc.io/) |
| **Storage & PWA** | Service Worker API, Cache Storage API, LocalStorage, Web App Manifest |
| **Telemetry & Logging** | VarVal Event Engine (Themed, color-coded console event telemetry) |

---

## 📁 Project Structure

```text
.
├── index.html           # Main HTML structure, layout templates, and modal drawers
├── styles.css           # Glassmorphism styling, responsive layout, and typography rules
├── app.js               # Application logic, state, APIs, particle engine, and UI rendering
├── config.example.js    # Environment configuration template (copy to config.js)
├── sw.js                # Service Worker for asset caching and offline resilience
├── bump-version.js      # Utility script for semantic versioning & cache timestamp updates
├── fonts/               # Self-hosted JetBrains Mono WOFF2 webfont files
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
git clone https://github.com/mmcvuur/weather.git
cd weather
```

### 2. (Optional) Configure Environment Keys
If you have a CARTO API key for custom dark basemaps, copy the template and insert your key:
```bash
cp config.example.js config.js
```
*(If omitted, the app automatically falls back to keyless Esri Dark Canvas basemaps.)*

### 3. Run with any local HTTP server
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
# Bump patch version (e.g., v2.6.2 -> v2.6.3)
node bump-version.js patch

# Bump minor version (e.g., v2.6.2 -> v2.7.0)
node bump-version.js minor

# Bump major version (e.g., v2.6.2 -> v3.0.0)
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
