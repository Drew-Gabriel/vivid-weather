// API URLs
const geoApiUrl = "https://geocoding-api.open-meteo.com/v1/search";
const weatherApiUrl = "https://api.open-meteo.com/v1/forecast";
const unsplashKey = "YOUR_REAL_KEY_HERE"; // Replace with your actual Unsplash API key

// Get city coordinates from Open-Meteo Geocoding API
export async function getCoordinates(city) {
  try {
    const geoRes = await fetch(`${geoApiUrl}?name=${encodeURIComponent(city)}`);
    if (!geoRes.ok) {
      console.error("Geo fetch failed:", geoRes.status);
      throw new Error(`Error fetching location data: ${geoRes.statusText}`);
    }

    const geoData = await geoRes.json();
    console.log("Geo Data:", geoData); // Log the data to check

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const { latitude, longitude } = geoData.results[0];
    return { latitude, longitude };
  } catch (err) {
    console.error("Error fetching coordinates:", err.message);
    throw err; // Re-throw the error after logging it
  }
}

export async function getWeather(latitude, longitude) {
  if (!latitude || !longitude) {
    console.error("Invalid coordinates:", latitude, longitude);
    throw new Error("Invalid coordinates");
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,pressure_msl,weathercode,precipitation&timezone=auto`;

  console.log("Weather API URL:", url);

  try {
    const weatherRes = await fetch(url);
    const responseBody = await weatherRes.text();
    console.log("Weather API Response:", responseBody);

    if (!weatherRes.ok) {
      console.error("Weather fetch failed:", weatherRes.status, responseBody);
      throw new Error(`Error fetching weather data: ${weatherRes.statusText}`);
    }

    const weatherData = JSON.parse(responseBody);
    return weatherData;
  } catch (err) {
    console.error("Error fetching weather data:", err.message);
    throw new Error(`Error fetching weather data: ${err.message}`);
  }
}

// Get weather description based on weather code
export function getWeatherDescription(code) {
  const descriptionMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Drizzle: Light",
    53: "Drizzle: Moderate",
    55: "Drizzle: Dense",
    56: "Freezing Drizzle: Light",
    57: "Freezing Drizzle: Dense",
    61: "Rain: Slight",
    63: "Rain: Moderate",
    65: "Rain: Heavy",
    66: "Freezing Rain: Light",
    67: "Freezing Rain: Heavy",
    71: "Snow fall: Slight",
    73: "Snow fall: Moderate",
    75: "Snow fall: Heavy",
    77: "Snow grains",
    80: "Rain showers: Slight",
    81: "Rain showers: Moderate",
    82: "Rain showers: Violent",
    85: "Snow showers: Slight",
    86: "Snow showers: Heavy",
    95: "Thunderstorm: Slight or moderate",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptionMap[code] || "Unknown weather";
}

// Get background image from Unsplash API based on the city
export async function getWeatherBackground(city) {
  try {
    const imgRes = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
        city
      )}+weather&client_id=${unsplashKey}`
    );
    if (!imgRes.ok) throw new Error("Error fetching background image");

    const imgData = await imgRes.json();
    console.log("Background Image Data:", imgData); // Log image data to check

    return imgData[0]?.urls?.regular || "default_background.jpg"; // Safe fallback
  } catch (err) {
    console.warn("Failed to load Unsplash image", err);
    return "default_background.jpg"; // Fallback to a default image
  }
}
