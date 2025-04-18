import {
  getCoordinates,
  getWeather,
  getWeatherBackground,
} from "./weather-api.js";

const cityInput = document.getElementById("cityInput");
const form = document.getElementById("searchForm");
const weatherDisplay = document.getElementById("weatherDisplay");
const forecastDiv = document.getElementById("forecastInfo");
const showForecastBtn = document.getElementById("showForecastBtn");
const loader = document.getElementById("loader");
const darkModeToggle = document.getElementById("darkModeToggle");
const background = document.getElementById("background");
const errorMessage = document.getElementById("errorMessage");
const searchHistoryContainer = document.getElementById("searchHistory");

// Load weather for a given city
async function loadWeather(city) {
  try {
    loader.classList.remove("hidden");

    const { latitude, longitude } = await getCoordinates(city);
    const weatherData = await getWeather(latitude, longitude);

    localStorage.setItem("weatherData", JSON.stringify(weatherData));
    localStorage.setItem("lastCity", city);

    displayWeather(weatherData, city);
    displayForecast(weatherData.hourly, weatherData.hourly_units);
    await setBackground(city);
    saveCityToHistory(city); // Save city to search history

    loader.classList.add("hidden");
  } catch (err) {
    loader.classList.add("hidden");
    handleError(err);
  }
}

// Display current weather
function displayWeather(data, city) {
  const current = data.current_weather;
  const weatherDescription = getWeatherDescription(current.weathercode);

  const html = `
    <h2>${city}</h2>
    <p><strong>${weatherDescription}</strong></p>
    <p>🌡 Temp: ${current.temperature}°C</p>
    <p>💨 Wind: ${current.windspeed} m/s</p>
    <p>🧭 Direction: ${current.winddirection}°</p>
  `;
  weatherDisplay.innerHTML = html;
}

// Display forecast
function displayForecast(hourly, units) {
  const { time, temperature_2m, weathercode, windspeed_10m } = hourly;
  const forecastHTML = time
    .slice(0, 12)
    .map(
      (t, i) => `
      <div class="forecast-card">
        <p><strong>${new Date(t).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</strong></p>
        <p>${getWeatherDescription(weathercode[i])}</p>
        <p>🌡 ${temperature_2m[i]}${units.temperature_2m}</p>
        <p>💨 ${windspeed_10m[i]}${units.windspeed_10m}</p>
      </div>
    `
    )
    .join("");
  forecastDiv.innerHTML = forecastHTML;
}

// Weather description helper
function getWeatherDescription(code) {
  const weatherCodes = {
    0: "☀️ Clear sky",
    1: "🌤 Mainly clear",
    2: "⛅ Partly cloudy",
    3: "☁️ Overcast",
    45: "🌫 Fog",
    51: "🌦 Light drizzle",
    61: "🌧 Light rain",
    80: "🌧 Rain showers",
    95: "⛈ Thunderstorm",
  };
  return weatherCodes[code] || "🌈 Weather info";
}

// Background image handler
async function setBackground(city) {
  try {
    const imgUrl = await getWeatherBackground(city);
    background.style.backgroundImage = `url(${imgUrl})`;
  } catch (err) {
    console.warn("Background image error:", err);
    background.style.backgroundImage = "url('default-background.jpg')"; // Fallback background
  }
}

// Handle search form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    loadWeather(city);
    errorMessage.classList.add("hidden"); // Hide error message after a new search
  }
});

// Load last searched city on page load
window.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    loadWeather(lastCity);
  }

  // Apply dark mode if saved
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
  }

  displaySearchHistory();
});

// Forecast toggle
showForecastBtn.addEventListener("click", () => {
  forecastDiv.classList.toggle("hidden");
});

// Dark mode toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
});

// Handle error
function handleError(err) {
  if (err.message.includes("City not found")) {
    errorMessage.textContent =
      "Sorry, we couldn't find that city. Please try another one!";
    errorMessage.classList.remove("hidden");
  } else {
    errorMessage.textContent = `Error: ${err.message}`;
    errorMessage.classList.remove("hidden");
  }
  weatherDisplay.innerHTML = "";
}

// Save city to search history
function saveCityToHistory(city) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }
  displaySearchHistory();
}

// Display search history
function displaySearchHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  searchHistoryContainer.innerHTML = "";
  history.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => loadWeather(city)); // Load weather when clicked
    searchHistoryContainer.appendChild(li);
  });
}
