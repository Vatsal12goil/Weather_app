// Selecting DOM elements
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// Replace with your OpenWeatherMap API Key
const API_KEY = "2a9af27d6f73ae3da42a01d9ac5ea9a8";

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const temp = (weatherItem.main.temp - 273.15).toFixed(2); // Convert Kelvin to Celsius
    const windSpeed = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;
    const description = weatherItem.weather[0].description;
    const icon = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;

    if (index === 0) {
        // Current weather card
        return `<div class="details">
                    <h2>${cityName} (${date})</h2>
                    <h6>Temperature: ${temp}°C</h6>
                    <h6>Wind: ${windSpeed} M/S</h6>
                    <h6>Humidity: ${humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="${icon}" alt="weather-icon">
                    <h6>${description}</h6>
                </div>`;
    } else {
        // 5-day forecast card
        return `<li class="card">
                    <h3>${date}</h3>
                    <img src="${icon}" alt="weather-icon">
                    <h6>Temp: ${temp}°C</h6>
                    <h6>Wind: ${windSpeed} M/S</h6>
                    <h6>Humidity: ${humidity}%</h6>
                </li>`;
    }
};

// Function to fetch and display weather details
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${'2a9af27d6f73ae3da42a01d9ac5ea9a8'}`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clear previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Create and display weather cards
            fiveDaysForecast.forEach((weatherItem, index) => {
                const cardHTML = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", cardHTML);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", cardHTML);
                }
            });
        })
        .catch(() => {
            alert("Failed to fetch weather details. Please try again.");
        });
};

// Function to fetch city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        alert("Please enter a city name!");
        return;
    }

    const GEO_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;

    fetch(GEO_API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) {
                alert(`No coordinates found for "${cityName}". Please check the city name.`);
                return;
            }
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("Failed to fetch city coordinates. Please try again.");
        });
};

// Function to fetch user location coordinates
const getUserCoordinates = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEO_API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(REVERSE_GEO_API_URL)
                .then(response => response.json())
                .then(data => {
                    if (!data.length) {
                        alert("Failed to retrieve your location. Please try again.");
                        return;
                    }
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("Failed to fetch location details. Please try again.");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Location access denied. Please allow access to use this feature.");
            } else {
                alert("Error retrieving location. Please try again.");
            }
        }
    );
};

// Event listeners for buttons and input
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => {
    if (e.key === "Enter") getCityCoordinates();
});

