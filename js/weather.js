// Fetch weather data from Open-Meteo API
async function fetchWeatherData(city) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&hourly=temperature_2m,humidity_2m,precipitation,wind_speed_10m,weathercode`
  );
  const data = await response.json();

  // Store data in JSON format in localStorage
  localStorage.setItem("weatherData", JSON.stringify(data));
  return data;
}

// Save and retrieve city preference from localStorage
function saveCityPreference(city) {
  let cityHistory = JSON.parse(localStorage.getItem("cityHistory")) || [];
  if (!cityHistory.includes(city)) {
    cityHistory.push(city);
  }
  localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// Dynamically create HTML for weather data
function createWeatherHTML(data) {
  const weatherContainer = document.querySelector(".weatherInfo");

  // Clear previous data
  weatherContainer.innerHTML = "";

  // Hourly Forecast Cards
  const hourlyData = data.hourly;
  hourlyData.temperature_2m.forEach((temp, index) => {
    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-card");

    // Create dynamic content for each forecast
    forecastCard.innerHTML = `
      <h3>Hour: ${index + 1}</h3>
      <p>Temperature: ${temp}°C</p>
      <p>Humidity: ${data.hourly.humidity_2m[index]}%</p>
      <p>Wind Speed: ${data.hourly.wind_speed_10m[index]} km/h</p>
      <p>Precipitation: ${data.hourly.precipitation[index]} mm</p>
    `;

    weatherContainer.appendChild(forecastCard);
  });
}

// Event for submitting search form
document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const city = document.getElementById("cityInput").value;
  saveCityPreference(city);
  fetchWeatherData(city).then((data) => {
    createWeatherHTML(data);
  });
});

// Event for dark mode toggle
document
  .getElementById("darkModeToggle")
  .addEventListener("click", function () {
    toggleDarkMode();
  });

// Display city search history
function displaySearchHistory() {
  const historyContainer = document.querySelector("#searchHistory");
  const cityHistory = JSON.parse(localStorage.getItem("cityHistory")) || [];

  cityHistory.forEach((city) => {
    const cityItem = document.createElement("li");
    cityItem.textContent = city;
    historyContainer.appendChild(cityItem);
  });
}

// Event for handling weather data fetch errors
function handleError(error) {
  alert("Error fetching weather data: " + error.message);
}

// Initially fetch weather data or use localStorage data
function initializeApp() {
  const city = localStorage.getItem("lastCity") || "London"; // Default city
  fetchWeatherData(city)
    .then((data) => createWeatherHTML(data))
    .catch((error) => handleError(error));
  displaySearchHistory();
}

initializeApp();
// Toggle between Celsius and Fahrenheit
document.getElementById("unit-toggle").addEventListener("click", toggleUnits);

function toggleUnits() {
  const unit =
    localStorage.getItem("unit") === "metric" ? "imperial" : "metric";
  localStorage.setItem("unit", unit);
  // Re-fetch weather data with the new unit
  fetchWeatherData(cityName, unit);
}

// Hover effect for forecast cards
const forecastCards = document.querySelectorAll(".forecast-card");
forecastCards.forEach((card) => {
  card.addEventListener("mouseover", () => {
    card.classList.add("hover");
  });
  card.addEventListener("mouseout", () => {
    card.classList.remove("hover");
  });
});

// Show and hide error messages
function showError(message) {
  const errorElement = document.querySelector(".error-message");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function hideError() {
  const errorElement = document.querySelector(".error-message");
  errorElement.style.display = "none";
}

// Search history interaction
const searchHistory = document.querySelector(".search-history");
searchHistory.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const city = event.target.textContent;
    fetchWeatherData(city);
  }
});
