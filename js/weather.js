const city = localStorage.getItem("lastCity");
const infoDiv = document.getElementById("weatherInfo");
const bgDiv = document.getElementById("background");

async function getCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) throw new Error("Error fetching location data");
  const geoData = await geoRes.json();
  if (!geoData.results) throw new Error("City not found");
  const { latitude, longitude } = geoData.results[0];
  return { latitude, longitude };
}

async function getWeather(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) throw new Error("Error fetching weather data");
  return await weatherRes.json();
}

async function setBackground(city) {
  const unsplashKey = "YOUR_UNSPLASH_KEY";
  try {
    const imgRes = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
        city
      )}+weather&client_id=${unsplashKey}`
    );
    if (!imgRes.ok) throw new Error("Error fetching background image");
    const imgData = await imgRes.json();
    bgDiv.style.backgroundImage = `url(${imgData[0].urls.full})`;
  } catch (err) {
    console.warn("Failed to load Unsplash image", err);
  }
}

function displayWeather(data, city) {
  const { temperature, windspeed, weathercode } = data.current_weather;
  const weatherDescription = getWeatherDescription(weathercode);
  const html = `
    <h2>${city}</h2>
    <p><strong>${weatherDescription}</strong></p>
    <p>🌡 Temp: ${temperature}°C</p>
    <p>💨 Wind: ${windspeed} m/s</p>
  `;
  infoDiv.innerHTML = html;
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    // Add more weather descriptions...
  };
  return weatherCodes[code] || "Unknown weather";
}

async function loadWeather() {
  if (!city) {
    infoDiv.innerHTML =
      "<p>No city found. Please go back and search again.</p>";
    return;
  }
  try {
    const { latitude, longitude } = await getCoordinates(city);
    const weatherData = await getWeather(latitude, longitude);
    displayWeather(weatherData, city);
    setBackground(city);
  } catch (err) {
    infoDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

loadWeather();
