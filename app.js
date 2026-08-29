if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        reg.update();
      })
      .catch(err => console.warn('SW failed:', err));

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

const DEFAULT_LOCATION = { lat: 50.8503, lon: 4.3517, name: "Brussels" };

const SOLAR_ICONS = {
  sunrise: `<svg class="solar-icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
    <path d="M12 2v6M12 2l-2.5 2.5M12 2l2.5 2.5" stroke="#ffd60a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 16a6 6 0 0 1 12 0" fill="#ffd60a" opacity="0.9"/>
    <line x1="3" y1="18" x2="21" y2="18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
  </svg>`,
  sunset: `<svg class="solar-icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
    <path d="M12 8v6M12 14l-2.5-2.5M12 14l2.5-2.5" stroke="#ff9f0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 16a6 6 0 0 1 12 0" fill="#ff9f0a" opacity="0.85"/>
    <line x1="3" y1="18" x2="21" y2="18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
  </svg>`
};

// --- COMPREHENSIVE WMO 4677 WEATHER INTERPRETATION CODES ---
const wmoCodes = {
  // 00–03: Clouds & Clear Sky
  0: { text: "Clear Sky", icon: "☀️", nightIcon: "🌙" },
  1: { text: "Mainly Clear", icon: "🌤️", nightIcon: "🌙" },
  2: { text: "Partly Cloudy", icon: "⛅", nightIcon: "☁️" },
  3: { text: "Overcast", icon: "☁️", nightIcon: "☁️" },

  // 04–09: Smoke, Haze, Dust & Sand
  4: { text: "Smoke", icon: "🌫️", nightIcon: "🌫️" },
  5: { text: "Haze", icon: "🌫️", nightIcon: "🌫️" },
  6: { text: "Widespread Dust", icon: "🌪️", nightIcon: "🌫️" },
  7: { text: "Blowing Dust / Sand", icon: "🌪️", nightIcon: "🏜️" },
  8: { text: "Dust Whirls", icon: "🌪️", nightIcon: "🌪️" },
  9: { text: "Duststorm in Distance", icon: "🌪️", nightIcon: "🏜️" },

  // 10–12: Mist & Shallow Fog
  10: { text: "Mist", icon: "🌫️", nightIcon: "🌫️" },
  11: { text: "Shallow Fog Patches", icon: "🌫️", nightIcon: "🌫️" },
  12: { text: "Continuous Shallow Fog", icon: "🌫️", nightIcon: "🌫️" },

  // 13–19: Atmospheric Phenomena & Squalls
  13: { text: "Visible Lightning", icon: "⚡", nightIcon: "⚡" },
  14: { text: "Precipitation in Sight (Virga)", icon: "🌦️", nightIcon: "🌧️" },
  15: { text: "Distant Precipitation", icon: "🌦️", nightIcon: "🌧️" },
  16: { text: "Nearby Precipitation", icon: "🌦️", nightIcon: "🌧️" },
  17: { text: "Dry Thunderstorm", icon: "🌩️", nightIcon: "🌩️" },
  18: { text: "Squalls", icon: "💨", nightIcon: "💨" },
  19: { text: "Funnel Cloud / Tornado", icon: "🌪️", nightIcon: "🌪️" },

  // 20–29: Preceding Weather Phenomena
  20: { text: "Recent Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  21: { text: "Recent Rain", icon: "🌧️", nightIcon: "🌧️" },
  22: { text: "Recent Snow", icon: "🌨️", nightIcon: "🌨️" },
  23: { text: "Recent Rain & Snow", icon: "🌨️", nightIcon: "🌨️" },
  24: { text: "Recent Freezing Rain", icon: "🌧️", nightIcon: "🌧️" },
  25: { text: "Recent Rain Showers", icon: "🌦️", nightIcon: "🌧️" },
  26: { text: "Recent Snow Showers", icon: "🌨️", nightIcon: "🌨️" },
  27: { text: "Recent Hail Showers", icon: "🌨️", nightIcon: "🌨️" },
  28: { text: "Recent Fog", icon: "🌫️", nightIcon: "🌫️" },
  29: { text: "Recent Thunderstorm", icon: "🌩️", nightIcon: "🌩️" },

  // 30–35: Duststorms & Sandstorms
  30: { text: "Slight Duststorm", icon: "🌪️", nightIcon: "🏜️" },
  31: { text: "Moderate Duststorm", icon: "🌪️", nightIcon: "🏜️" },
  32: { text: "Increasing Duststorm", icon: "🌪️", nightIcon: "🏜️" },
  33: { text: "Severe Duststorm", icon: "🌪️", nightIcon: "🏜️" },
  34: { text: "Heavy Duststorm", icon: "🌪️", nightIcon: "🏜️" },
  35: { text: "Intense Duststorm", icon: "🌪️", nightIcon: "🏜️" },

  // 36–39: Drifting & Blowing Snow
  36: { text: "Low Drifting Snow", icon: "🌨️", nightIcon: "❄️" },
  37: { text: "Heavy Drifting Snow", icon: "🌨️", nightIcon: "❄️" },
  38: { text: "Blowing Snow", icon: "🌨️", nightIcon: "❄️" },
  39: { text: "Heavy Blowing Snow", icon: "🌨️", nightIcon: "❄️" },

  // 40–49: Fog & Ice Fog
  40: { text: "Distant Fog", icon: "🌫️", nightIcon: "🌫️" },
  41: { text: "Fog Patches", icon: "🌫️", nightIcon: "🌫️" },
  42: { text: "Thinning Fog", icon: "🌫️", nightIcon: "🌫️" },
  43: { text: "Dense Thinning Fog", icon: "🌫️", nightIcon: "🌫️" },
  44: { text: "Fog", icon: "🌫️", nightIcon: "🌫️" },
  45: { text: "Fog", icon: "🌫️", nightIcon: "🌫️" },
  46: { text: "Thickening Fog", icon: "🌫️", nightIcon: "🌫️" },
  47: { text: "Dense Thickening Fog", icon: "🌫️", nightIcon: "🌫️" },
  48: { text: "Depositing Rime Fog", icon: "🌫️", nightIcon: "🌫️" },
  49: { text: "Dense Rime Fog", icon: "🌫️", nightIcon: "🌫️" },

  // 50–59: Drizzle
  50: { text: "Intermittent Slight Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  51: { text: "Light Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  52: { text: "Intermittent Moderate Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  53: { text: "Moderate Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  54: { text: "Intermittent Dense Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  55: { text: "Dense Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  56: { text: "Light Freezing Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  57: { text: "Dense Freezing Drizzle", icon: "🌧️", nightIcon: "🌧️" },
  58: { text: "Drizzle & Rain Mixed", icon: "🌧️", nightIcon: "🌧️" },
  59: { text: "Heavy Drizzle & Rain", icon: "🌧️", nightIcon: "🌧️" },

  // 60–69: Rain
  60: { text: "Intermittent Slight Rain", icon: "🌧️", nightIcon: "🌧️" },
  61: { text: "Slight Rain", icon: "🌧️", nightIcon: "🌧️" },
  62: { text: "Intermittent Moderate Rain", icon: "🌧️", nightIcon: "🌧️" },
  63: { text: "Moderate Rain", icon: "🌧️", nightIcon: "🌧️" },
  64: { text: "Intermittent Heavy Rain", icon: "🌧️", nightIcon: "🌧️" },
  65: { text: "Heavy Rain", icon: "🌧️", nightIcon: "🌧️" },
  66: { text: "Light Freezing Rain", icon: "🌧️", nightIcon: "🌧️" },
  67: { text: "Heavy Freezing Rain", icon: "🌧️", nightIcon: "🌧️" },
  68: { text: "Slight Rain & Snow Mixed", icon: "🌨️", nightIcon: "🌨️" },
  69: { text: "Heavy Rain & Snow Mixed", icon: "🌨️", nightIcon: "🌨️" },

  // 70–79: Solid Precipitation (Snow, Grains, Ice Pellets)
  70: { text: "Intermittent Slight Snow", icon: "🌨️", nightIcon: "🌨️" },
  71: { text: "Slight Snow", icon: "🌨️", nightIcon: "🌨️" },
  72: { text: "Intermittent Moderate Snow", icon: "🌨️", nightIcon: "🌨️" },
  73: { text: "Moderate Snow", icon: "🌨️", nightIcon: "🌨️" },
  74: { text: "Intermittent Heavy Snow", icon: "🌨️", nightIcon: "🌨️" },
  75: { text: "Heavy Snow", icon: "🌨️", nightIcon: "🌨️" },
  76: { text: "Diamond Dust", icon: "❄️", nightIcon: "❄️" },
  77: { text: "Snow Grains", icon: "🌨️", nightIcon: "🌨️" },
  78: { text: "Snow Crystals", icon: "❄️", nightIcon: "❄️" },
  79: { text: "Ice Pellets / Sleet", icon: "🌨️", nightIcon: "🌨️" },

  // 80–90: Showery Precipitation
  80: { text: "Slight Rain Showers", icon: "🌦️", nightIcon: "🌧️" },
  81: { text: "Moderate Rain Showers", icon: "🌦️", nightIcon: "🌧️" },
  82: { text: "Violent Rain Showers", icon: "🌧️", nightIcon: "🌧️" },
  83: { text: "Slight Mixed Showers", icon: "🌨️", nightIcon: "🌨️" },
  84: { text: "Heavy Mixed Showers", icon: "🌨️", nightIcon: "🌨️" },
  85: { text: "Slight Snow Showers", icon: "🌨️", nightIcon: "🌨️" },
  86: { text: "Heavy Snow Showers", icon: "🌨️", nightIcon: "🌨️" },
  87: { text: "Slight Snow Pellet Showers", icon: "🌨️", nightIcon: "🌨️" },
  88: { text: "Heavy Snow Pellet Showers", icon: "🌨️", nightIcon: "🌨️" },
  89: { text: "Slight Hail Showers", icon: "🌨️", nightIcon: "🌨️" },
  90: { text: "Heavy Hail Showers", icon: "🌨️", nightIcon: "🌨️" },

  // 91–99: Thunderstorms
  91: { text: "Slight Rain with Thunder", icon: "⛈️", nightIcon: "⛈️" },
  92: { text: "Heavy Rain with Thunder", icon: "⛈️", nightIcon: "⛈️" },
  93: { text: "Slight Snow with Thunder", icon: "⛈️", nightIcon: "⛈️" },
  94: { text: "Heavy Snow with Thunder", icon: "⛈️", nightIcon: "⛈️" },
  95: { text: "Thunderstorm", icon: "🌩️", nightIcon: "🌩️" },
  96: { text: "Thunderstorm & Hail", icon: "🌩️", nightIcon: "🌩️" },
  97: { text: "Heavy Thunderstorm", icon: "⛈️", nightIcon: "⛈️" },
  98: { text: "Dust Thunderstorm", icon: "🌩️", nightIcon: "🌩️" },
  99: { text: "Heavy Hail Thunderstorm", icon: "🌩️", nightIcon: "🌩️" }
};

// Weather Code Categorization Sets for Helper & Engine Logic
const PRECIP_CODES = new Set([
  14, 15, 16, 20, 21, 22, 23, 24, 25, 26, 27,
  50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
  91, 92, 93, 94, 95, 96, 97, 98, 99
]);

const RAIN_CODES = new Set([
  20, 21, 24, 25,
  50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  80, 81, 82,
  91, 92
]);

const SNOW_CODES = new Set([
  22, 23, 26, 27,
  36, 37, 38, 39,
  70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  83, 84, 85, 86, 87, 88, 89, 90,
  93, 94
]);

const THUNDER_CODES = new Set([
  13, 17, 29, 91, 92, 93, 94, 95, 96, 97, 98, 99
]);

const FOG_DUST_CODES = new Set([
  4, 5, 6, 7, 8, 9, 10, 11, 12, 28,
  30, 31, 32, 33, 34, 35,
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49
]);

function getWeatherMeta(code, isDay = 1) {
  const match = wmoCodes[code] || { text: "Unknown", icon: "🌡️", nightIcon: "🌡️" };
  return { text: match.text, icon: isDay ? match.icon : match.nightIcon };
}

function getHourlyWeatherMeta(code, isDay = 1, precipProb = 0) {
  const isPrecipCode = PRECIP_CODES.has(code);

  let effectiveCode = code;
  // If the model reported clear/cloudy but there is a significant probability of precipitation,
  // ensure the icon reflects rain/showers rather than a clear sun (☀️).
  if (!isPrecipCode && precipProb >= 25) {
    if (code === 3 || precipProb >= 60) {
      effectiveCode = 61; // Rain (🌧️)
    } else {
      effectiveCode = 80; // Rain Showers (🌦️ by day, 🌧️ by night)
    }
  }

  const meta = getWeatherMeta(effectiveCode, isDay);
  const showPrecip = (isPrecipCode || precipProb >= 25) && precipProb >= 20;

  return {
    text: meta.text,
    icon: meta.icon,
    showPrecip,
    precipProb
  };
}

// --- STORAGE MANAGEMENT ---
function getLastGPSLocation() {
  try {
    const cached = localStorage.getItem('ios_weather_last_gps');
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    return null;
  }
}

function saveLastGPSLocation(loc) {
  try {
    localStorage.setItem('ios_weather_last_gps', JSON.stringify(loc));
  } catch (err) {
    console.error("Failed to save last GPS location:", err);
  }
}

function removeLastGPSLocation() {
  try {
    localStorage.removeItem('ios_weather_last_gps');
  } catch (err) {
    console.error("Failed to remove last GPS location:", err);
  }
}

function getStoredLocations() {
  try {
    const saved = localStorage.getItem('ios_weather_saved');
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    return [];
  }
}

function saveLocations(locations) {
  try {
    localStorage.setItem('ios_weather_saved', JSON.stringify(locations));
  } catch (err) {
    console.error("Failed to save locations:", err);
  }
}

function getActiveLocation() {
  try {
    const cached = localStorage.getItem('ios_weather_active');
    return cached ? JSON.parse(cached) : DEFAULT_LOCATION;
  } catch (err) {
    return DEFAULT_LOCATION;
  }
}

function setActiveLocation(loc) {
  try {
    localStorage.setItem('ios_weather_active', JSON.stringify(loc));
  } catch (err) {
    console.error("Failed to set active location:", err);
  }
}

let lastWeatherData = null;
let lastAqiData = null;
let lastFetchLat = null;
let lastFetchLon = null;
let lastFetchCity = null;

// --- UNIT CONVERSION & PREFERENCES ---
function getPreferredUnit() {
  try {
    return localStorage.getItem('ios_weather_unit') || 'C';
  } catch (e) {
    return 'C';
  }
}

function setPreferredUnit(unit) {
  try {
    localStorage.setItem('ios_weather_unit', unit);
  } catch (e) {
    console.warn("Failed to save unit preference:", e);
  }
}

function convertTemp(celsius) {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  const unit = getPreferredUnit();
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

function convertWindSpeed(kmh) {
  if (kmh === undefined || kmh === null || isNaN(kmh)) return { value: '--', unit: 'km/h' };
  const unit = getPreferredUnit();
  if (unit === 'F') {
    const mph = Math.round(kmh * 0.621371);
    return { value: mph, unit: 'mph' };
  }
  return { value: Math.round(kmh), unit: 'km/h' };
}

function updateUnitButtonsUI() {
  const unit = getPreferredUnit();
  const cBtn = document.getElementById("unit-c-btn");
  const fBtn = document.getElementById("unit-f-btn");
  if (cBtn && fBtn) {
    if (unit === 'F') {
      cBtn.classList.remove("active");
      fBtn.classList.add("active");
    } else {
      fBtn.classList.remove("active");
      cBtn.classList.add("active");
    }
  }
}

function switchUnit(unit) {
  if (getPreferredUnit() === unit) return;
  setPreferredUnit(unit);
  updateUnitButtonsUI();

  if (lastWeatherData) {
    renderAllWeather(lastWeatherData, lastAqiData, lastFetchLat, lastFetchLon, lastFetchCity, false);
  }
}

// --- PAYLOAD CACHING & OFFLINE STORAGE ---
function getCachedPayload(lat, lon) {
  try {
    const key = `ios_weather_payload_${Number(lat).toFixed(2)}_${Number(lon).toFixed(2)}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function saveCachedPayload(lat, lon, cityName, weatherData, aqiData) {
  try {
    const key = `ios_weather_payload_${Number(lat).toFixed(2)}_${Number(lon).toFixed(2)}`;
    const payload = {
      timestamp: Date.now(),
      lat,
      lon,
      cityName,
      weatherData,
      aqiData
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn("Failed to cache weather payload:", err);
  }
}

function renderAllWeather(weatherData, aqiData, lat, lon, cityName, isCached = false) {
  lastWeatherData = weatherData;
  lastAqiData = aqiData;
  lastFetchLat = lat;
  lastFetchLon = lon;
  lastFetchCity = cityName;

  const displayCity = cityName ? cityName.split(',')[0].trim() : "Current Location";
  document.getElementById("city").textContent = displayCity;

  if (weatherData && weatherData.current && weatherData.current.temperature_2m !== undefined) {
    const currentTemp = convertTemp(weatherData.current.temperature_2m);
    document.title = `${displayCity} ${currentTemp}°`;
  } else {
    document.title = displayCity;
  }

  renderCurrent(weatherData);
  renderAISummary(weatherData, aqiData);
  renderHourly(weatherData);
  renderDaily(weatherData);
  renderAirQuality(aqiData);
  initOrUpdateMap(lat, lon, cityName);

  const badgeEl = document.getElementById("cache-status-badge");
  if (badgeEl) {
    if (isCached) {
      badgeEl.textContent = "Cached";
      badgeEl.style.display = "inline-block";
    } else {
      badgeEl.style.display = "none";
    }
  }
}

// --- INITIALIZATION ---
async function initApp() {
  updateUnitButtonsUI();
  initPullToRefresh();

  const activeLoc = getActiveLocation();
  const cached = getCachedPayload(activeLoc.lat, activeLoc.lon);

  if (cached && cached.weatherData) {
    // Zero-latency startup hydration
    renderAllWeather(cached.weatherData, cached.aqiData, cached.lat, cached.lon, cached.cityName, true);
  }

  fetchWeather(activeLoc.lat, activeLoc.lon, activeLoc.name);

  if (activeLoc.isGPS) {
    updateGPSInBackground();
  }
}

function locateUserAndClose() {
  locateUser({ closeDrawer: true, forceFresh: true });
}

let isLocatingGPS = false;

async function locateUser(options = {}) {
  const { closeDrawer = false, forceFresh = true, targetBtn = null } = options;

  if (isLocatingGPS) return;

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  isLocatingGPS = true;
  const gpsBtn = document.getElementById("gps-locate-btn") || document.querySelector(".gps-action-btn");
  if (gpsBtn) {
    gpsBtn.classList.add("locating");
  }
  if (targetBtn) {
    targetBtn.classList.add("spinning");
  }

  document.getElementById("condition").textContent = "Acquiring position...";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const name = await getCityName(lat, lon);
        const loc = { lat, lon, name, isGPS: true };
        
        saveLastGPSLocation(loc);
        setActiveLocation(loc);
        fetchWeather(lat, lon, name);
        renderSavedLocations();

        if (closeDrawer) {
          toggleDrawer(false);
        }
      } catch (err) {
        console.error("Error processing GPS location:", err);
      } finally {
        isLocatingGPS = false;
        if (gpsBtn) {
          gpsBtn.classList.remove("locating");
        }
        if (targetBtn) {
          targetBtn.classList.remove("spinning");
        }
      }
    },
    (err) => {
      console.warn("Geolocation error:", err);
      isLocatingGPS = false;
      if (gpsBtn) {
        gpsBtn.classList.remove("locating");
      }
      if (targetBtn) {
        targetBtn.classList.remove("spinning");
      }

      let errMsg = "Location access denied";
      if (err.code === 2) {
        errMsg = "Location unavailable";
      } else if (err.code === 3) {
        errMsg = "Location request timed out";
      }
      document.getElementById("condition").textContent = errMsg;
      alert(`Could not acquire GPS position: ${errMsg}. Check browser location permissions.`);
    },
    { timeout: 12000, maximumAge: forceFresh ? 0 : 60000, enableHighAccuracy: true }
  );
}

function updateGPSInBackground() {
  if (!navigator.geolocation) return;
  const activeLoc = getActiveLocation();
  if (!activeLoc || !activeLoc.isGPS) return;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const currentActive = getActiveLocation();

    if (!currentActive || !currentActive.isGPS) return;

    // Skip redundant fetch if location has not changed significantly (~100m)
    if (Math.abs(currentActive.lat - lat) < 0.001 && Math.abs(currentActive.lon - lon) < 0.001) {
      return;
    }

    const name = await getCityName(lat, lon);
    const loc = { lat, lon, name, isGPS: true };
    
    saveLastGPSLocation(loc);
    setActiveLocation(loc);
    fetchWeather(lat, lon, name);
  }, (err) => console.warn("Background GPS update failed:", err), { timeout: 10000, maximumAge: 60000 });
}

async function getCityName(lat, lon) {
  try {
    const url = `https://api-bdc.io/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Reverse geocode HTTP error");
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || "Current Location";
  } catch (err) {
    return "Current Location";
  }
}

let weatherAbortController = null;

async function fetchWeather(lat, lon, cityName) {
  if (weatherAbortController) {
    weatherAbortController.abort();
  }
  weatherAbortController = new AbortController();
  const signal = weatherAbortController.signal;

  const displayCity = cityName ? cityName.split(',')[0].trim() : "Current Location";
  document.getElementById("city").textContent = displayCity;

  if (!lastWeatherData) {
    document.getElementById("condition").textContent = "Loading weather...";
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility,surface_pressure&hourly=temperature_2m,weather_code,is_day,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=10&timezone=auto`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm10,pm2_5&timezone=auto`;

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl, { signal }),
      fetch(aqiUrl, { signal }).catch(err => {
        console.warn("AQI fetch failed:", err);
        return null;
      })
    ]);

    if (!weatherRes.ok) throw new Error(`HTTP error! status: ${weatherRes.status}`);
    const weatherData = await weatherRes.json();

    let aqiData = null;
    if (aqiRes && aqiRes.ok) {
      aqiData = await aqiRes.json();
    }

    saveCachedPayload(lat, lon, cityName, weatherData, aqiData);
    renderAllWeather(weatherData, aqiData, lat, lon, cityName, false);
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error("Failed to load weather data:", error);
    if (!lastWeatherData) {
      renderAirQuality(null);
      document.getElementById("condition").textContent = "Unable to fetch weather data";
      document.getElementById("current-temp").textContent = "--";
      document.getElementById("today-range").textContent = "H: --°  L: --°";
      document.title = `${displayCity} --°`;
      const aiTextEl = document.getElementById("ai-summary-text");
      if (aiTextEl) aiTextEl.textContent = "AI summary unavailable. Check network connection or try again.";
    } else {
      const badgeEl = document.getElementById("cache-status-badge");
      if (badgeEl) {
        badgeEl.textContent = "Offline";
        badgeEl.style.display = "inline-block";
      }
    }
  }
}

// --- AIR QUALITY CONTROLLER ---
function getAQIMeta(aqi) {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return {
      level: "Air Quality Unavailable",
      desc: "Air quality data is currently unavailable for this location.",
      color: "rgba(255, 255, 255, 0.7)",
      percent: 0
    };
  }

  const num = Math.round(aqi);
  const percent = Math.min(Math.max((num / 300) * 100, 2), 100);

  if (num <= 50) {
    return {
      level: `${num} - Good`,
      desc: "Air quality is satisfactory, and air pollution poses little or no risk.",
      color: "#30db5b",
      percent
    };
  } else if (num <= 100) {
    return {
      level: `${num} - Moderate`,
      desc: "Air quality is acceptable; however, some pollutants may pose a moderate concern for sensitive individuals.",
      color: "#ffd60a",
      percent
    };
  } else if (num <= 150) {
    return {
      level: `${num} - Unhealthy for Sensitive Groups`,
      desc: "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
      color: "#ff9f0a",
      percent
    };
  } else if (num <= 200) {
    return {
      level: `${num} - Unhealthy`,
      desc: "Some members of the general public may experience health effects; members of sensitive groups may experience more serious effects.",
      color: "#ff453a",
      percent
    };
  } else if (num <= 300) {
    return {
      level: `${num} - Very Unhealthy`,
      desc: "Health alert: The risk of health effects is increased for everyone.",
      color: "#bf5af2",
      percent
    };
  } else {
    return {
      level: `${num} - Hazardous`,
      desc: "Health warning of emergency conditions: Everyone is more likely to be affected.",
      color: "#ac2424",
      percent
    };
  }
}

function renderAirQuality(aqiData) {
  const cardEl = document.getElementById("aqi-card") || document.querySelector(".aqi-card");
  if (!cardEl) return;

  if (!aqiData || !aqiData.current) {
    cardEl.style.display = "none";
    return;
  }

  let aqiVal = aqiData.current.us_aqi;
  if (aqiVal === null || aqiVal === undefined || isNaN(aqiVal)) {
    aqiVal = aqiData.current.european_aqi;
  }

  if (aqiVal === null || aqiVal === undefined || isNaN(aqiVal)) {
    cardEl.style.display = "none";
    return;
  }

  const meta = getAQIMeta(aqiVal);

  const levelEl = document.getElementById("aqi-level");
  const descEl = document.getElementById("aqi-desc");
  const dotEl = document.getElementById("aqi-dot");

  if (levelEl) {
    levelEl.textContent = meta.level;
    levelEl.style.color = meta.color;
  }
  if (descEl) descEl.textContent = meta.desc;
  if (dotEl) {
    dotEl.style.left = `${meta.percent}%`;
    dotEl.style.background = meta.color;
  }

  cardEl.style.display = "";
}

// --- SUNSET & WIND UTILITIES ---
function getCardinalDirection(deg) {
  if (deg === undefined || deg === null || isNaN(deg)) return "--";
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return `${directions[index]} (${Math.round(deg)}°)`;
}

function renderSunrisesunset(daily, currentTimeIso) {
  const titleEl = document.getElementById("sunset-card-title");
  const timeEl = document.getElementById("sunset-time");
  const subEl = document.getElementById("sunset-sub");

  if (!titleEl || !timeEl || !subEl || !daily.sunrise || !daily.sunset) return;

  const currentIso = currentTimeIso ? currentTimeIso.slice(0, 16) : new Date().toISOString().slice(0, 16);
  const todaySunrise = daily.sunrise[0] ? daily.sunrise[0].slice(11, 16) : "--:--";
  const todaySunset = daily.sunset[0] ? daily.sunset[0].slice(11, 16) : "--:--";
  const tomorrowSunrise = daily.sunrise[1] ? daily.sunrise[1].slice(11, 16) : "--:--";
  const todaySunsetIso = daily.sunset[0] ? daily.sunset[0].slice(0, 16) : "";

  if (todaySunsetIso && currentIso < todaySunsetIso) {
    titleEl.innerHTML = `${SOLAR_ICONS.sunset} Sunset`;
    timeEl.textContent = todaySunset;
    subEl.textContent = `Sunrise: ${todaySunrise}`;
  } else {
    titleEl.innerHTML = `${SOLAR_ICONS.sunrise} Sunrise`;
    timeEl.textContent = tomorrowSunrise;
    subEl.textContent = `Sunset: ${todaySunset}`;
  }
}

// --- PRECIPITATION RADAR MAP & PLAYBACK CONTROLLER ---
let map = null;
let fsMap = null;
let locationMarker = null;
let fsLocationMarker = null;
let currentMapCoords = { lat: 50.8503, lon: 4.3517 };

let radarFrames = [];
let radarTileLayers = [];
let fsRadarTileLayers = [];
let currentFrameIndex = 0;
let isRadarPlaying = false;
let radarPlaybackTimer = null;

const CARTO_API_KEY = "cb1_2iez_1_744fcfd7feb10866db03cc60";

function addDarkBasemapLayers(targetMap) {
  if (CARTO_API_KEY) {
    L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_API_KEY)}`, {
      maxZoom: 18,
      subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(targetMap);
  } else {
    // Default: Free, keyless Esri World Dark Gray Canvas (Dark iOS aesthetic, no watermarks)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16,
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ'
    }).addTo(targetMap);

    // Reference layer overlay (crisp place names & boundaries over dark base and radar)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16,
      zIndex: 150
    }).addTo(targetMap);
  }
}

function initOrUpdateMap(lat, lon, cityName) {
  currentMapCoords = { lat, lon };

  if (typeof L === 'undefined') {
    console.warn("Leaflet library not loaded yet");
    return;
  }

  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  if (!map) {
    map = L.map("map", {
      center: [lat, lon],
      zoom: 7,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false
    });

    addDarkBasemapLayers(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    loadPrecipitationRadar();
    setTimeout(() => map.invalidateSize(), 150);
  } else {
    map.setView([lat, lon], 7, { animate: true });
    loadPrecipitationRadar();
    setTimeout(() => map.invalidateSize(), 150);
  }

  if (locationMarker) {
    locationMarker.setLatLng([lat, lon]);
  } else {
    const pulseIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="user-location-marker"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    locationMarker = L.marker([lat, lon], { icon: pulseIcon }).addTo(map);
  }
}

function clearRadarLayers() {
  pauseRadarPlayback();
  radarTileLayers.forEach(layer => {
    if (map) map.removeLayer(layer);
  });
  fsRadarTileLayers.forEach(layer => {
    if (fsMap) fsMap.removeLayer(layer);
  });
  radarTileLayers = [];
  fsRadarTileLayers = [];
}

async function loadPrecipitationRadar() {
  try {
    let data = null;

    // Primary source: LibreWXR (Open-Source, FOSS, Privacy-first)
    try {
      const res = await fetch("https://api.librewxr.net/public/weather-maps.json");
      if (res.ok) {
        data = await res.json();
      }
    } catch (primaryErr) {
      console.warn("LibreWXR primary endpoint unreachable, attempting fallback:", primaryErr);
    }

    // Fallback source: RainViewer
    if (!data || !data.host || !data.radar) {
      const fallbackRes = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      if (!fallbackRes.ok) throw new Error("Radar API error");
      data = await fallbackRes.json();
    }

    if (data && data.host && data.radar && data.radar.past && data.radar.past.length > 0) {
      const rawFrames = [...data.radar.past, ...(data.radar.nowcast || [])];

      radarFrames = rawFrames.map(frame => {
        const dateObj = new Date(frame.time * 1000);
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        const tileUrl = `${data.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        return {
          time: frame.time,
          path: frame.path,
          timeStr,
          tileUrl
        };
      });

      clearRadarLayers();

      if (map) {
        radarTileLayers = radarFrames.map(frame => {
          return L.tileLayer(frame.tileUrl, {
            opacity: 0,
            tileSize: 256,
            maxNativeZoom: 12,
            maxZoom: 18,
            zIndex: 100
          }).addTo(map);
        });
      }

      if (fsMap) {
        fsRadarTileLayers = radarFrames.map(frame => {
          return L.tileLayer(frame.tileUrl, {
            opacity: 0,
            tileSize: 256,
            maxNativeZoom: 12,
            maxZoom: 18,
            zIndex: 100
          }).addTo(fsMap);
        });
      }

      currentFrameIndex = radarFrames.length - 1;
      updateActiveRadarFrame();
    }
  } catch (err) {
    console.warn("Failed to load precipitation radar tiles:", err);
    const timeEl = document.getElementById("map-time");
    if (timeEl) timeEl.textContent = "Radar";
  }
}

function updateActiveRadarFrame() {
  if (radarFrames.length === 0) return;

  const activeFrame = radarFrames[currentFrameIndex];
  if (!activeFrame) return;

  const timeStr = `Radar (${activeFrame.timeStr})`;
  const mainTimeEl = document.getElementById("map-time");
  const fsTimeEl = document.getElementById("fs-map-time");
  if (mainTimeEl) mainTimeEl.textContent = timeStr;
  if (fsTimeEl) fsTimeEl.textContent = timeStr;

  radarTileLayers.forEach((layer, idx) => {
    layer.setOpacity(idx === currentFrameIndex ? 0.65 : 0);
  });

  fsRadarTileLayers.forEach((layer, idx) => {
    layer.setOpacity(idx === currentFrameIndex ? 0.65 : 0);
  });
}

function resetRadarTime() {
  pauseRadarPlayback();
  if (radarFrames.length > 0) {
    currentFrameIndex = radarFrames.length - 1;
    updateActiveRadarFrame();
  }
}

function toggleRadarPlayback() {
  if (isRadarPlaying) {
    pauseRadarPlayback();
  } else {
    startRadarPlayback();
  }
}

function startRadarPlayback() {
  if (radarFrames.length === 0) return;
  isRadarPlaying = true;

  updatePlaybackButtonsUI(true);

  if (currentFrameIndex >= radarFrames.length - 1) {
    currentFrameIndex = 0;
    updateActiveRadarFrame();
  }

  clearInterval(radarPlaybackTimer);
  radarPlaybackTimer = setInterval(() => {
    currentFrameIndex++;
    if (currentFrameIndex >= radarFrames.length) {
      currentFrameIndex = 0;
    }
    updateActiveRadarFrame();
  }, 650);
}

function pauseRadarPlayback() {
  isRadarPlaying = false;
  if (radarPlaybackTimer) {
    clearInterval(radarPlaybackTimer);
    radarPlaybackTimer = null;
  }
  updatePlaybackButtonsUI(false);
}

function updatePlaybackButtonsUI(playing) {
  const mainPlayBtn = document.getElementById("radar-play-btn");
  const fsPlayBtn = document.getElementById("fs-radar-play-btn");

  if (mainPlayBtn) {
    mainPlayBtn.textContent = playing ? "⏸" : "▶";
    if (playing) mainPlayBtn.classList.add("active");
    else mainPlayBtn.classList.remove("active");
  }

  if (fsPlayBtn) {
    fsPlayBtn.textContent = playing ? "⏸ Pause" : "▶ Play";
    if (playing) fsPlayBtn.classList.add("active");
    else fsPlayBtn.classList.remove("active");
  }
}

function recenterMap() {
  if (map && currentMapCoords) {
    map.setView([currentMapCoords.lat, currentMapCoords.lon], 7, { animate: true });
  }
}

// --- FULLSCREEN RADAR MAP MODAL ---
let mainScrollPosBeforeMapModal = 0;

function toggleFullscreenMap(open) {
  const modal = document.getElementById("fullscreen-map-modal");
  const appEl = document.getElementById("app");
  if (!modal) return;

  if (open) {
    if (appEl) {
      mainScrollPosBeforeMapModal = appEl.scrollTop;
      appEl.scrollTop = 0;
      appEl.classList.add("drawer-open");
    }
    if (modal) modal.scrollTop = 0;
    modal.style.display = "flex";
    modal.style.visibility = "visible";
    void modal.offsetWidth;
    modal.classList.add("active");

    initOrUpdateFullscreenMap();
    setTimeout(() => {
      if (fsMap) fsMap.invalidateSize();
    }, 100);
  } else {
    modal.classList.remove("active");
    if (appEl) {
      appEl.classList.remove("drawer-open");
      appEl.scrollTop = mainScrollPosBeforeMapModal;
    }
    setTimeout(() => {
      if (!modal.classList.contains("active")) {
        modal.style.display = "none";
        modal.style.visibility = "hidden";
      }
    }, 250);
  }
}

function initOrUpdateFullscreenMap() {
  const lat = currentMapCoords.lat;
  const lon = currentMapCoords.lon;

  if (typeof L === 'undefined') return;
  const container = document.getElementById("fs-map");
  if (!container) return;

  if (!fsMap) {
    fsMap = L.map("fs-map", {
      center: [lat, lon],
      zoom: map ? map.getZoom() : 7,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: true,
      attributionControl: true
    });

    addDarkBasemapLayers(fsMap);

    if (radarFrames.length > 0) {
      fsRadarTileLayers = radarFrames.map((frame, idx) => {
        return L.tileLayer(frame.tileUrl, {
          opacity: idx === currentFrameIndex ? 0.65 : 0,
          tileSize: 256,
          maxNativeZoom: 12,
          maxZoom: 18,
          zIndex: 100
        }).addTo(fsMap);
      });
    }

    const pulseIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="user-location-marker"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    fsLocationMarker = L.marker([lat, lon], { icon: pulseIcon }).addTo(fsMap);
  } else {
    const currentZoom = map ? map.getZoom() : 7;
    fsMap.setView([lat, lon], currentZoom, { animate: false });
    if (fsLocationMarker) fsLocationMarker.setLatLng([lat, lon]);
  }

  setTimeout(() => {
    if (fsMap) fsMap.invalidateSize();
  }, 150);
}

function recenterFullscreenMap() {
  if (fsMap && currentMapCoords) {
    fsMap.setView([currentMapCoords.lat, currentMapCoords.lon], 7, { animate: true });
  }
}

function initCompassTicks() {
  const container = document.getElementById("compass-ticks");
  if (!container || container.children.length > 0) return;

  const cx = 65;
  const cy = 65;
  const rInner = 43;
  const rOuter = 47;
  const lines = [];

  for (let i = 0; i < 60; i++) {
    const angleDeg = i * 6;
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy + rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy + rOuter * Math.sin(angleRad);
    const isMajor = i % 5 === 0;
    const opacity = isMajor ? "0.85" : "0.35";
    const strokeWidth = isMajor ? "1.5" : "1";

    lines.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#ffffff" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" />`);
  }

  container.innerHTML = lines.join("");
}

function renderCurrent(data) {
  const current = data.current;
  const daily = data.daily;
  const meta = getWeatherMeta(current.weather_code, current.is_day);

  const appEl = document.getElementById("app");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!current.is_day) {
    appEl.classList.add("night-theme");
    document.body.classList.add("night-theme");
    document.documentElement.classList.add("night-theme");
    if (themeMeta) themeMeta.setAttribute("content", "#0f172a");
  } else {
    appEl.classList.remove("night-theme");
    document.body.classList.remove("night-theme");
    document.documentElement.classList.remove("night-theme");
    if (themeMeta) themeMeta.setAttribute("content", "#3a7bd5");
  }

  applyWeatherEffects(current.weather_code, current.is_day);

  document.getElementById("current-temp").textContent = `${convertTemp(current.temperature_2m)}`;
  document.getElementById("condition").textContent = meta.text;
  document.getElementById("today-range").textContent = `H:${convertTemp(daily.temperature_2m_max[0])}°  L:${convertTemp(daily.temperature_2m_min[0])}°`;

  // Populate Wind Card
  const windObj = convertWindSpeed(current.wind_speed_10m);
  const gustsObj = convertWindSpeed(current.wind_gusts_10m);
  const windDir = current.wind_direction_10m !== undefined ? current.wind_direction_10m : 0;
  const cardinalStr = getCardinalDirection(windDir);
  const cardinalCode = cardinalStr.split(' ')[0];

  const speedRowEl = document.getElementById("wind-speed-row");
  if (speedRowEl) speedRowEl.textContent = `${windObj.value} ${windObj.unit}`;

  const gustsRowEl = document.getElementById("wind-gusts-row");
  if (gustsRowEl) gustsRowEl.textContent = `${gustsObj.value} ${gustsObj.unit}`;

  const dirRowEl = document.getElementById("wind-dir-row");
  if (dirRowEl) dirRowEl.textContent = `${Math.round(windDir)}° ${cardinalCode}`;

  initCompassTicks();

  const compassSpeedVal = document.getElementById("compass-speed-val");
  if (compassSpeedVal) compassSpeedVal.textContent = `${windObj.value}`;

  const compassUnitEl = document.querySelector(".compass-svg-unit");
  if (compassUnitEl) compassUnitEl.textContent = `${windObj.unit}`;

  const needleGroup = document.getElementById("compass-needle-group");
  if (needleGroup) {
    needleGroup.setAttribute("transform", `translate(65, 65) rotate(${windDir})`);
  }

  // Populate Sunset / Sunrise Card
  if (daily.sunrise && daily.sunset) {
    renderSunrisesunset(daily, current.time);
  }

  document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
  const dewPointApprox = Math.round(current.temperature_2m - ((100 - current.relative_humidity_2m) / 5));
  document.getElementById("dew-point").textContent = `Dew point ${convertTemp(dewPointApprox)}°`;

  const uvVal = current.uv_index !== undefined ? current.uv_index.toFixed(1) : "--";
  let uvDesc = "Low";
  const uvNum = parseFloat(uvVal);
  if (uvNum >= 11) uvDesc = "Extreme";
  else if (uvNum >= 8) uvDesc = "Very High";
  else if (uvNum >= 6) uvDesc = "High";
  else if (uvNum >= 3) uvDesc = "Moderate";
  document.getElementById("uv-index").textContent = uvVal;
  document.getElementById("uv-level").textContent = uvDesc;

  const visKm = current.visibility !== undefined && current.visibility !== null ? Math.round(current.visibility / 1000) : null;
  if (visKm !== null) {
    document.getElementById("visibility").textContent = `${visKm} km`;
    document.getElementById("visibility-sub").textContent = visKm >= 10 ? "Clear view" : "Reduced visibility";
  } else {
    document.getElementById("visibility").textContent = "-- km";
    document.getElementById("visibility-sub").textContent = "Data unavailable";
  }

  const pressureHpa = current.surface_pressure !== undefined ? Math.round(current.surface_pressure) : "--";
  document.getElementById("pressure").textContent = `${pressureHpa} hPa`;

  document.getElementById("apparent-temp").textContent = `${convertTemp(current.apparent_temperature)}°`;
}

// --- AI WEATHER SUMMARY CONTROLLER ---
function generateAISummary(data, aqiData) {
  if (!data || !data.current || !data.daily || !data.hourly) {
    return {
      text: "Weather data currently unavailable to synthesize AI summary.",
      chips: []
    };
  }

  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;
  const meta = getWeatherMeta(current.weather_code, current.is_day);

  const maxTemp = convertTemp(daily.temperature_2m_max[0]);
  const minTemp = convertTemp(daily.temperature_2m_min[0]);
  const feelsLike = convertTemp(current.apparent_temperature);
  const currentTemp = convertTemp(current.temperature_2m);

  // Hourly window inspection (next 12 hours)
  const currentHourIso = current.time ? current.time.slice(0, 13) : new Date().toISOString().slice(0, 13);
  let startIndex = hourly.time.findIndex(t => t.startsWith(currentHourIso));
  if (startIndex === -1) startIndex = 0;

  const next12Hours = hourly.time.slice(startIndex, startIndex + 12);
  const next12PrecipProb = hourly.precipitation_probability ? hourly.precipitation_probability.slice(startIndex, startIndex + 12) : [];
  const next12Codes = hourly.weather_code.slice(startIndex, startIndex + 12);
  const next12UV = hourly.uv_index ? hourly.uv_index.slice(startIndex, startIndex + 12) : [];

  const maxPrecipProb = next12PrecipProb.length > 0 ? Math.max(...next12PrecipProb) : 0;
  const maxUV = daily.uv_index_max ? daily.uv_index_max[0] : (next12UV.length > 0 ? Math.max(...next12UV) : (current.uv_index || 0));

  // Find rain window if rain is expected
  let rainStartHour = null;
  let rainEndHour = null;
  for (let i = 0; i < next12PrecipProb.length; i++) {
    const prob = next12PrecipProb[i];
    const code = next12Codes[i];
    const isRain = RAIN_CODES.has(code) || THUNDER_CODES.has(code);
    if ((prob >= 35 || isRain) && rainStartHour === null) {
      const timeStr = next12Hours[i];
      rainStartHour = parseInt(timeStr.slice(11, 13), 10);
    }
    if (rainStartHour !== null && (prob < 20 && !isRain) && rainEndHour === null) {
      const timeStr = next12Hours[i];
      rainEndHour = parseInt(timeStr.slice(11, 13), 10);
    }
  }

  // Wind analysis
  const windObj = convertWindSpeed(current.wind_speed_10m);
  const gustObj = convertWindSpeed(current.wind_gusts_10m);
  const isWindy = typeof windObj.value === 'number' && (windObj.value >= 22 || gustObj.value >= 32);

  // Construct narrative components
  const sentences = [];
  const locName = lastFetchCity ? lastFetchCity.split(',')[0].trim() : 'your area';

  // Sentence 1: General weather & temp range
  if ([0, 1].includes(current.weather_code)) {
    sentences.push(`Expect mostly ${current.is_day ? 'sunny' : 'clear'} conditions in ${locName} today, with highs reaching ${maxTemp}° and a low of ${minTemp}°.`);
  } else if ([2, 3].includes(current.weather_code)) {
    sentences.push(`Partly cloudy to overcast skies will prevail today in ${locName}, with temperatures peaking at ${maxTemp}° and dropping to ${minTemp}°.`);
  } else if (THUNDER_CODES.has(current.weather_code)) {
    sentences.push(`Thunderstorm activity and precipitation expected today in ${locName}, with highs reaching ${maxTemp}°.`);
  } else if (SNOW_CODES.has(current.weather_code)) {
    sentences.push(`Snowfall and winter conditions expected in ${locName} today, with temperatures hovering around ${maxTemp}° (feeling like ${feelsLike}°).`);
  } else if (RAIN_CODES.has(current.weather_code)) {
    sentences.push(`Showery and rainy conditions will dominate today in ${locName}, with highs around ${maxTemp}° and current temperature at ${currentTemp}°.`);
  } else if (FOG_DUST_CODES.has(current.weather_code)) {
    sentences.push(`Hazy and reduced visibility conditions (${meta.text}) expected today in ${locName}, with highs around ${maxTemp}°.`);
  } else if ([18, 19].includes(current.weather_code)) {
    sentences.push(`Severe atmospheric activity (${meta.text}) reported in ${locName} today, with temperatures around ${maxTemp}°.`);
  } else {
    sentences.push(`${meta.text} conditions expected today in ${locName}, ranging from ${minTemp}° to ${maxTemp}°.`);
  }

  // Sentence 2: Precipitation window & probability
  if (maxPrecipProb >= 35 || rainStartHour !== null) {
    if (rainStartHour !== null) {
      const formatHour = (h) => `${String(h).padStart(2, '0')}:00`;
      if (rainEndHour !== null) {
        sentences.push(`Rain is most likely between ${formatHour(rainStartHour)} and ${formatHour(rainEndHour)} with up to ${maxPrecipProb}% probability.`);
      } else {
        sentences.push(`Precipitation is expected starting around ${formatHour(rainStartHour)} with a ${maxPrecipProb}% chance.`);
      }
    } else {
      sentences.push(`Scatterings of rain are possible throughout the day (${maxPrecipProb}% chance).`);
    }
  } else {
    sentences.push(`No significant precipitation is expected for the remainder of the day.`);
  }

  // Sentence 3: Comfort, Wind, UV or AQI highlight
  const tempDiff = Math.abs(current.temperature_2m - current.apparent_temperature);
  if (tempDiff >= 3) {
    if (current.apparent_temperature < current.temperature_2m) {
      sentences.push(`Breezes will make it feel cooler at ${feelsLike}°.`);
    } else {
      sentences.push(`Elevated humidity will make it feel warmer at ${feelsLike}°.`);
    }
  } else if (isWindy) {
    sentences.push(`Wind gusts may reach up to ${gustObj.value} ${gustObj.unit}.`);
  } else if (maxUV >= 6) {
    sentences.push(`UV index will reach a high peak of ${maxUV.toFixed(1)} around midday.`);
  }

  // Recommendation Badges (Chips)
  const chips = [];

  // Precip / Sky chip
  if (maxPrecipProb >= 35 || rainStartHour !== null || RAIN_CODES.has(current.weather_code)) {
    chips.push({ icon: '☔', label: `Rain Expected (${maxPrecipProb}%)`, type: 'rain' });
    chips.push({ icon: '☂️', label: 'Bring Umbrella', type: 'advice' });
  } else if (SNOW_CODES.has(current.weather_code)) {
    chips.push({ icon: '❄️', label: 'Snow & Icy Conditions', type: 'cold' });
  } else if (THUNDER_CODES.has(current.weather_code)) {
    chips.push({ icon: '🌩️', label: 'Thunderstorms Expected', type: 'storm' });
  } else if (FOG_DUST_CODES.has(current.weather_code)) {
    chips.push({ icon: '🌫️', label: `${meta.text} - Low Visibility`, type: 'fog' });
  } else if ([0, 1].includes(current.weather_code)) {
    chips.push({ icon: '☀️', label: 'Sunny & Clear', type: 'clear' });
  } else if ([2, 3].includes(current.weather_code)) {
    chips.push({ icon: '🌤️', label: 'Partly Cloudy', type: 'cloud' });
  }

  // Temperature / Clothing chip
  const rawMax = daily.temperature_2m_max[0];
  if (rawMax <= 10) {
    chips.push({ icon: '🧥', label: 'Dress Warmly', type: 'cold' });
  } else if (rawMax >= 25) {
    chips.push({ icon: '👕', label: 'Light Clothing', type: 'warm' });
  } else {
    chips.push({ icon: '🧥', label: 'Layer Up', type: 'mild' });
  }

  // UV chip
  if (maxUV >= 6) {
    chips.push({ icon: '🧴', label: `High UV (${maxUV.toFixed(1)}) - Use SPF`, type: 'uv' });
  } else if ([0, 1].includes(current.weather_code) && current.is_day) {
    chips.push({ icon: '🕶️', label: 'Sunglasses Recommended', type: 'uv' });
  }

  // Wind chip
  if (isWindy) {
    chips.push({ icon: '💨', label: `Breezy (${gustObj.value} ${gustObj.unit})`, type: 'wind' });
  }

  // Outdoor activity chip
  if (maxPrecipProb < 35 && rawMax >= 14 && rawMax <= 28 && (!aqiData || (aqiData.current && aqiData.current.us_aqi <= 50))) {
    chips.push({ icon: '🏃', label: 'Great Outdoor Conditions', type: 'outdoor' });
  }

  return {
    text: sentences.join(' '),
    chips: chips
  };
}

function renderAISummary(weatherData, aqiData) {
  const cardEl = document.getElementById("ai-summary-card");
  const textEl = document.getElementById("ai-summary-text");
  const chipsEl = document.getElementById("ai-summary-chips");
  const timeEl = document.getElementById("ai-summary-time");

  if (!cardEl || !textEl) return;

  const result = generateAISummary(weatherData, aqiData);
  textEl.textContent = result.text;

  if (timeEl) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `Updated ${hh}:${mm}`;
  }

  if (chipsEl) {
    if (result.chips && result.chips.length > 0) {
      chipsEl.style.display = "flex";
      chipsEl.innerHTML = result.chips.map(c => `
        <div class="ai-chip ai-chip-${c.type}">
          <span class="ai-chip-icon">${c.icon}</span>
          <span class="ai-chip-label">${c.label}</span>
        </div>
      `).join("");
    } else {
      chipsEl.style.display = "none";
    }
  }
}

function triggerAISummaryRefresh() {
  const refreshBtn = document.getElementById("ai-refresh-btn");
  const cardEl = document.getElementById("ai-summary-card");
  if (refreshBtn) refreshBtn.classList.add("spinning");
  if (cardEl) cardEl.classList.add("pulse-shimmer");

  setTimeout(() => {
    if (lastWeatherData) {
      renderAISummary(lastWeatherData, lastAqiData);
    }
    if (refreshBtn) refreshBtn.classList.remove("spinning");
    if (cardEl) cardEl.classList.remove("pulse-shimmer");
  }, 400);
}

function renderHourly(data) {
  const hourlyContainer = document.getElementById("hourly-list");
  if (!hourlyContainer) return;

  // Collect solar events (sunrise/sunset)
  const solarEvents = [];
  if (data.daily && data.daily.sunrise && data.daily.sunset) {
    for (let d = 0; d < data.daily.sunrise.length; d++) {
      if (data.daily.sunrise[d]) {
        solarEvents.push({ type: 'sunrise', iso: data.daily.sunrise[d], icon: SOLAR_ICONS.sunrise, label: 'Sunrise' });
      }
      if (data.daily.sunset[d]) {
        solarEvents.push({ type: 'sunset', iso: data.daily.sunset[d], icon: SOLAR_ICONS.sunset, label: 'Sunset' });
      }
    }
  }

  // Align start index with data.current.time if available (same location timezone), fallback to ISO hour
  const currentHourIso = data.current?.time ? data.current.time.slice(0, 13) : new Date().toISOString().slice(0, 13);
  let startIndex = data.hourly.time.findIndex(t => t.startsWith(currentHourIso));
  if (startIndex === -1) startIndex = 0;

  const itemsHtml = [];
  for (let i = startIndex; i < startIndex + 24 && i < data.hourly.time.length; i++) {
    const timeStr = data.hourly.time[i];
    const nextTimeStr = data.hourly.time[i + 1] || "";
    const hourNum = parseInt(timeStr.slice(11, 13), 10);
    const hourLabel = i === startIndex ? "Now" : `${String(hourNum).padStart(2, '0')}:00`;

    const temp = convertTemp(data.hourly.temperature_2m[i]);
    const code = data.hourly.weather_code[i];
    const isDay = data.hourly.is_day ? data.hourly.is_day[i] : 1;
    const precipProb = data.hourly.precipitation_probability ? Math.round(data.hourly.precipitation_probability[i]) : 0;
    const meta = getHourlyWeatherMeta(code, isDay, precipProb);

    const precipHtml = meta.showPrecip 
      ? `<span class="hourly-precip">${precipProb}%</span>` 
      : "";

    itemsHtml.push(`
      <div class="hourly-item">
        <span class="hourly-time">${hourLabel}</span>
        <span class="hourly-icon">${meta.icon}</span>
        ${precipHtml}
        <span class="hourly-temp"><span class="hourly-temp-val">${temp}</span><span class="hourly-degree">°</span></span>
      </div>
    `);

    // Check if a solar event falls between this hour slot and the next
    if (nextTimeStr) {
      const currentIsoWindow = timeStr.slice(0, 16);
      const nextIsoWindow = nextTimeStr.slice(0, 16);

      const matchingEvent = solarEvents.find(e => {
        const eIso = e.iso.slice(0, 16);
        return eIso >= currentIsoWindow && eIso < nextIsoWindow && eIso >= currentHourIso;
      });

      if (matchingEvent) {
        const eventTimeLabel = matchingEvent.iso.slice(11, 16);
        itemsHtml.push(`
          <div class="hourly-item">
            <span class="hourly-time">${eventTimeLabel}</span>
            <span class="hourly-icon">${matchingEvent.icon}</span>
            <span class="hourly-event-label">${matchingEvent.label}</span>
          </div>
        `);
      }
    }
  }

  hourlyContainer.innerHTML = itemsHtml.join("");
}

// Helper to map a temperature (°C) to Apple's iOS color palette
function getTempColor(celsius) {
  if (celsius <= 0) return '#64d2ff';  /* Light Blue (Freezing) */
  if (celsius <= 12) return '#30db5b'; /* Cool Green */
  if (celsius <= 20) return '#ffd60a'; /* Mild Yellow */
  if (celsius <= 28) return '#ff9f0a'; /* Warm Orange */
  return '#ff453a';                    /* Hot Red */
}

function renderDaily(data) {
  const dailyContainer = document.getElementById("daily-list");
  if (!dailyContainer) return;

  const daily = data.daily;
  const rawGlobalMin = Math.min(...daily.temperature_2m_min);
  const rawGlobalMax = Math.max(...daily.temperature_2m_max);
  const totalRange = rawGlobalMax - rawGlobalMin || 1;

  const rowsHtml = daily.time.map((dateStr, index) => {
    const dateObj = new Date(dateStr + "T00:00:00");
    const dayName = index === 0 ? "Today" : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    const rawMin = daily.temperature_2m_min[index];
    const rawMax = daily.temperature_2m_max[index];
    const minTemp = convertTemp(rawMin);
    const maxTemp = convertTemp(rawMax);
    const code = daily.weather_code[index];
    const meta = getWeatherMeta(code, 1);

    const leftPercent = ((rawMin - rawGlobalMin) / totalRange) * 100;
    const widthPercent = ((rawMax - rawMin) / totalRange) * 100;

    const startColor = getTempColor(rawMin);
    const endColor = getTempColor(rawMax);

    return `
      <div class="daily-row">
        <span class="day-name">${dayName}</span>
        <span class="day-icon">${meta.icon}</span>
        <div class="temp-bar-container">
          <span class="low-temp">${minTemp}°</span>
          <div class="bar-bg">
            <div class="bar-fill" style="left: ${leftPercent}%; width: ${Math.max(widthPercent, 8)}%; background: linear-gradient(90deg, ${startColor}, ${endColor});"></div>
          </div>
          <span class="high-temp">${maxTemp}°</span>
        </div>
      </div>
    `;
  });

  dailyContainer.innerHTML = rowsHtml.join("");
}

// --- LOCATIONS MODAL & SEARCH ---
let mainScrollPosBeforeDrawer = 0;

function toggleDrawer(open) {
  const drawer = document.getElementById("drawer");
  const appEl = document.getElementById("app");
  const searchInput = document.getElementById("search-input");

  if (open) {
    renderSavedLocations();
    if (appEl) {
      mainScrollPosBeforeDrawer = appEl.scrollTop;
      appEl.scrollTop = 0;
      appEl.classList.add("drawer-open");
    }
    if (drawer) drawer.scrollTop = 0;
    drawer.style.display = "flex";
    drawer.style.visibility = "visible";
    void drawer.offsetWidth;
    drawer.classList.add("active");
  } else {
    if (searchInput) searchInput.blur();
    drawer.classList.remove("active");
    if (appEl) {
      appEl.classList.remove("drawer-open");
      appEl.scrollTop = mainScrollPosBeforeDrawer;
    }

    // Force reset any WebKit virtual keyboard scroll offset
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    setTimeout(() => {
      if (!drawer.classList.contains("active")) {
        drawer.style.display = "none";
        drawer.style.visibility = "hidden";
      }
    }, 250);
    const searchResults = document.getElementById("search-results");
    if (searchResults) searchResults.innerHTML = "";
    if (searchInput) searchInput.value = "";
  }
}

// Search Debounce & AbortController to prevent API hammering & race conditions
let searchAbortController = null;
let searchDebounceTimer = null;

function handleSearch(query) {
  clearTimeout(searchDebounceTimer);
  if (searchAbortController) {
    searchAbortController.abort();
    searchAbortController = null;
  }

  const resultsContainer = document.getElementById("search-results");
  if (!query || query.trim().length < 2) {
    resultsContainer.innerHTML = "";
    return;
  }

  searchDebounceTimer = setTimeout(() => {
    executeSearch(query.trim());
  }, 300);
}

async function executeSearch(query) {
  const resultsContainer = document.getElementById("search-results");
  searchAbortController = new AbortController();

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const res = await fetch(url, { signal: searchAbortController.signal });
    if (!res.ok) throw new Error("Search request failed");
    const data = await res.json();

    resultsContainer.innerHTML = "";
    if (data.results && data.results.length > 0) {
      data.results.forEach(loc => {
        const item = document.createElement("div");
        item.className = "location-item";

        const info = document.createElement("div");
        info.className = "location-item-info";

        const nameSpan = document.createElement("span");
        nameSpan.className = "location-item-name";
        nameSpan.textContent = loc.name;

        const subSpan = document.createElement("span");
        subSpan.className = "location-item-sub";
        subSpan.textContent = [loc.admin1, loc.country].filter(Boolean).join(", ");

        info.appendChild(nameSpan);
        info.appendChild(subSpan);
        item.appendChild(info);

        item.onclick = () => selectAndSaveLocation(loc.latitude, loc.longitude, loc.name, loc.country);
        resultsContainer.appendChild(item);
      });
    } else {
      resultsContainer.innerHTML = `<div class="empty-state">No locations found.</div>`;
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn("Geocoding search failed:", err);
      resultsContainer.innerHTML = `<div class="empty-state">Search failed. Please try again.</div>`;
    }
  }
}

function selectAndSaveLocation(lat, lon, name, country) {
  const fullLabel = country ? `${name}, ${country}` : name;
  const newLoc = { id: String(Date.now() + Math.random()), lat, lon, name: fullLabel };

  const saved = getStoredLocations();
  // Check for duplicate locations by coordinates or full label
  const exists = saved.some(l => 
    l.name === fullLabel || (Math.abs(l.lat - lat) < 0.01 && Math.abs(l.lon - lon) < 0.01)
  );

  if (!exists) {
    saved.push(newLoc);
    saveLocations(saved);
  }

  setActiveLocation(newLoc);
  fetchWeather(lat, lon, fullLabel);
  toggleDrawer(false);
}

function renderSavedLocations() {
  const gpsList = document.getElementById("gps-list");
  const savedList = document.getElementById("saved-list");
  if (!gpsList || !savedList) return;

  gpsList.innerHTML = "";
  savedList.innerHTML = "";

  const lastGPS = getLastGPSLocation();
  const saved = getStoredLocations();

  // 1. Render Detected GPS Location Section
  if (lastGPS) {
    const gpsItem = document.createElement("div");
    gpsItem.className = "location-item gps-location-item";

    const info = document.createElement("div");
    info.className = "location-item-info";

    const nameSpan = document.createElement("span");
    nameSpan.className = "location-item-name";
    const primaryName = lastGPS.name ? lastGPS.name.split(',')[0].trim() : "Current Location";
    nameSpan.textContent = `📍 ${primaryName}`;

    const subSpan = document.createElement("span");
    subSpan.className = "location-item-sub";
    subSpan.textContent = "Detected via GPS";

    info.appendChild(nameSpan);
    info.appendChild(subSpan);
    gpsItem.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "location-item-actions";

    const badge = document.createElement("span");
    badge.className = "gps-badge";
    badge.textContent = "GPS";
    actions.appendChild(badge);

    const refreshBtn = document.createElement("button");
    refreshBtn.className = "location-action-btn gps-refresh-btn";
    refreshBtn.innerHTML = "↻";
    refreshBtn.setAttribute("title", "Obtain new GPS location");
    refreshBtn.setAttribute("aria-label", "Obtain new GPS location");
    refreshBtn.onclick = (e) => refreshGPSLocation(e, refreshBtn);
    actions.appendChild(refreshBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("title", "Delete GPS location");
    deleteBtn.setAttribute("aria-label", "Delete GPS location");
    deleteBtn.onclick = (e) => deleteGPSLocation(e);
    actions.appendChild(deleteBtn);

    gpsItem.appendChild(actions);

    gpsItem.onclick = () => {
      setActiveLocation(lastGPS);
      fetchWeather(lastGPS.lat, lastGPS.lon, lastGPS.name);
      toggleDrawer(false);
    };

    gpsList.appendChild(gpsItem);
  } else {
    gpsList.innerHTML = `<div class="empty-state">No GPS location detected. Click the button above to acquire your current location.</div>`;
  }

  // 2. Render Saved Locations Section
  if (saved.length === 0) {
    savedList.innerHTML = `<div class="empty-state">No saved locations yet. Search above to add one.</div>`;
    return;
  }

  saved.forEach((loc) => {
    const item = document.createElement("div");
    item.className = "location-item";

    const info = document.createElement("div");
    info.className = "location-item-info";

    const nameSpan = document.createElement("span");
    nameSpan.className = "location-item-name";
    nameSpan.textContent = loc.name;
    info.appendChild(nameSpan);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("title", `Delete ${loc.name}`);
    deleteBtn.setAttribute("aria-label", `Delete ${loc.name}`);
    const targetId = loc.id || loc.name;
    deleteBtn.onclick = (e) => deleteLocation(e, targetId);

    item.appendChild(info);
    item.appendChild(deleteBtn);

    item.onclick = () => {
      setActiveLocation(loc);
      fetchWeather(loc.lat, loc.lon, loc.name);
      toggleDrawer(false);
    };

    savedList.appendChild(item);
  });
}

function refreshGPSLocation(event, btnElement) {
  if (event) event.stopPropagation();
  locateUser({ closeDrawer: false, forceFresh: true, targetBtn: btnElement });
}

function deleteGPSLocation(event) {
  if (event) event.stopPropagation();

  const lastGPS = getLastGPSLocation();
  removeLastGPSLocation();

  const activeLoc = getActiveLocation();
  const isCurrentActiveGPS = activeLoc && (
    activeLoc.isGPS || 
    (lastGPS && Math.abs(activeLoc.lat - lastGPS.lat) < 0.001 && Math.abs(activeLoc.lon - lastGPS.lon) < 0.001)
  );

  if (isCurrentActiveGPS) {
    const saved = getStoredLocations();
    const fallback = saved.length > 0 ? saved[0] : DEFAULT_LOCATION;
    setActiveLocation(fallback);
    fetchWeather(fallback.lat, fallback.lon, fallback.name);
  }

  renderSavedLocations();
}

function deleteLocation(event, id) {
  event.stopPropagation();
  let saved = getStoredLocations();
  saved = saved.filter(loc => (loc.id ? loc.id !== id : loc.name !== id));
  saveLocations(saved);

  const activeLoc = getActiveLocation();
  if (activeLoc && (activeLoc.id === id || activeLoc.name === id)) {
    const lastGPS = getLastGPSLocation();
    const fallback = lastGPS || (saved.length > 0 ? saved[0] : DEFAULT_LOCATION);
    setActiveLocation(fallback);
    fetchWeather(fallback.lat, fallback.lon, fallback.name);
  }

  renderSavedLocations();
}

// --- PULL TO REFRESH CONTROLLER ---
function initPullToRefresh() {
  const container = document.getElementById("app");
  const indicator = document.getElementById("pull-indicator");
  const icon = document.getElementById("pull-icon");
  const text = document.getElementById("pull-text");
  if (!container || !indicator || !icon || !text) return;

  let startY = 0;
  let isPulling = false;
  let isRefreshing = false;
  const PULL_THRESHOLD = 60;

  function resetIndicator() {
    indicator.style.transform = "translate(-50%, -140%)";
    indicator.classList.remove("pulling", "ready", "refreshing");
    icon.textContent = "↓";
    text.textContent = "Pull to refresh";
    isRefreshing = false;
    isPulling = false;
  }

  container.addEventListener("touchstart", (e) => {
    const drawer = document.getElementById("drawer");
    if (drawer && drawer.classList.contains("active")) return;
    if (container.scrollTop <= 2 && !isRefreshing) {
      startY = e.touches[0].pageY;
      isPulling = true;
    }
  }, { passive: true });

  container.addEventListener("touchmove", (e) => {
    if (!isPulling || isRefreshing) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;

    if (diff > 0 && container.scrollTop <= 2) {
      if (e.cancelable) e.preventDefault();
      const pullDist = Math.min(diff * 0.45, 80);
      // Map drag distance into overlay translation
      const translateY = -140 + (pullDist / 80) * 140;
      indicator.style.transform = `translate(-50%, ${translateY}%)`;
      indicator.classList.add("pulling");

      if (pullDist >= PULL_THRESHOLD) {
        indicator.classList.add("ready");
        text.textContent = "Release to refresh";
      } else {
        indicator.classList.remove("ready");
        text.textContent = "Pull to refresh";
      }
    }
  }, { passive: false });

  const endPull = async () => {
    if (!isPulling || isRefreshing) return;

    if (indicator.classList.contains("ready")) {
      isRefreshing = true;
      isPulling = false;
      indicator.style.transform = "translate(-50%, 0%)";
      indicator.classList.remove("ready");
      indicator.classList.add("refreshing");
      icon.textContent = "🔄";
      text.textContent = "Updating weather...";

      try {
        const activeLoc = getActiveLocation();
        await fetchWeather(activeLoc.lat, activeLoc.lon, activeLoc.name);
      } catch (err) {
        console.warn("Pull refresh error:", err);
      }

      setTimeout(() => {
        resetIndicator();
      }, 600);
    } else {
      resetIndicator();
    }
  };

  container.addEventListener("touchend", endPull);
  container.addEventListener("touchcancel", endPull);
}

// --- DYNAMIC WEATHER CANVAS ENGINE ---
class WeatherCanvasEngine {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);
    if (!this.canvas || !this.container) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.currentCode = null;
    this.isDay = 1;
    this.width = 0;
    this.height = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else if (this.currentCode !== null) {
        this.start();
      }
    });
  }

  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setWeather(code, isDay) {
    if (this.currentCode === code && this.isDay === isDay && this.particles.length > 0) return;
    this.currentCode = code;
    this.isDay = isDay;
    this.createParticles();
    this.start();
  }

  createParticles() {
    this.particles = [];
    const code = this.currentCode;
    const isRain = RAIN_CODES.has(code) || THUNDER_CODES.has(code);
    const isSnow = SNOW_CODES.has(code);
    const isThunder = THUNDER_CODES.has(code);
    const isFog = FOG_DUST_CODES.has(code);

    const w = this.width || 360;
    const h = this.height || 640;

    if (isRain || isThunder) {
      const count = isThunder || [65, 82, 92, 94, 97, 99].includes(code) ? 50 : 35;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          length: Math.random() * 14 + 10,
          speed: Math.random() * 8 + 12,
          opacity: Math.random() * 0.4 + 0.25
        });
      }
    } else if (isSnow) {
      const count = [75, 86, 88, 90, 94].includes(code) ? 50 : 35;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 2.5 + 1.2,
          speed: Math.random() * 1.2 + 0.8,
          swing: Math.random() * Math.PI * 2,
          swingSpeed: Math.random() * 0.02 + 0.01,
          opacity: Math.random() * 0.6 + 0.3
        });
      }
    } else if (isFog) {
      const count = 4;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 120 + 80,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.12 + 0.06
        });
      }
    } else if (!this.isDay && [0, 1, 2].includes(code)) {
      const count = 40;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * (h * 0.6),
          radius: Math.random() * 1.3 + 0.6,
          opacity: Math.random() * 0.7 + 0.2,
          twinkleSpeed: Math.random() * 0.03 + 0.008,
          twinkleDir: Math.random() > 0.5 ? 1 : -1
        });
      }
    }
  }

  start() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const loop = () => {
      this.updateAndDraw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  updateAndDraw() {
    if (!this.ctx || !this.width || !this.height) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const code = this.currentCode;
    const isRain = RAIN_CODES.has(code) || THUNDER_CODES.has(code);
    const isSnow = SNOW_CODES.has(code);
    const isThunder = THUNDER_CODES.has(code);
    const isFog = FOG_DUST_CODES.has(code);

    if (isThunder && Math.random() < 0.008) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    if (isRain || isThunder) {
      this.ctx.lineWidth = 1.2;
      this.ctx.lineCap = 'round';
      for (const p of this.particles) {
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - 2, p.y + p.length);
        this.ctx.stroke();

        p.y += p.speed;
        p.x -= 0.6;

        if (p.y > this.height) {
          p.y = -p.length;
          p.x = Math.random() * this.width;
        }
      }
    } else if (isSnow) {
      for (const p of this.particles) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speed;
        p.swing += p.swingSpeed;
        p.x += Math.sin(p.swing) * 0.6;

        if (p.y > this.height) {
          p.y = -p.radius;
          p.x = Math.random() * this.width;
        }
      }
    } else if (isFog) {
      for (const p of this.particles) {
        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < -p.radius) p.x = this.width + p.radius;
        if (p.x > this.width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = this.height + p.radius;
        if (p.y > this.height + p.radius) p.y = -p.radius;
      }
    } else if (!this.isDay && [0, 1, 2].includes(code)) {
      for (const p of this.particles) {
        p.opacity += p.twinkleSpeed * p.twinkleDir;
        if (p.opacity >= 0.85) { p.opacity = 0.85; p.twinkleDir = -1; }
        if (p.opacity <= 0.15) { p.opacity = 0.15; p.twinkleDir = 1; }

        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}

let weatherCanvasInstance = null;

function applyWeatherEffects(code, isDay = 1) {
  if (!weatherCanvasInstance) {
    weatherCanvasInstance = new WeatherCanvasEngine("weather-canvas", "app");
  }
  if (weatherCanvasInstance) {
    weatherCanvasInstance.setWeather(code, isDay);
  }
}

initApp();
