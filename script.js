const apiKey = "e7f9ad2c952e21b15199b4f65e60c77f";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

const locationInput = document.getElementById("locationInput");
const searchButton = document.getElementById("searchButton");
const locationElement = document.getElementById("location");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const forecastList = document.getElementById("forecastList");
const forecastChartCanvas = document.getElementById("forecastChart");
const forecastGraphBox = document.querySelector(".forecast-graph-box");

let forecastChart;
let forecastData = null;

const defaultBg =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1500&q=80";

function setWeatherBackground(main) {
  let bgUrl = "";
  switch (main) {
    case "Clear":
      bgUrl =
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80";
      break;
    case "Clouds":
      bgUrl =
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1500&q=80";
      break;
    case "Rain":
      bgUrl =
        "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1500&q=80";
      break;
    case "Drizzle":
      bgUrl =
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1500&q=80";
      break;
    case "Thunderstorm":
      bgUrl =
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1500&q=80";
      break;
    case "Snow":
      bgUrl =
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1500&q=80";
      break;
    case "Mist":
      bgUrl =
        "https://images.unsplash.com/photo-1482841628122-9080d44bb807?auto=format&fit=crop&w=1500&q=80";
      break;
    case "Fog":
      bgUrl =
        "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=1500&q=80";
      break;
    default:
      bgUrl = defaultBg;
  }
  document.body.style.background = `url('${bgUrl}') no-repeat center center fixed`;
  document.body.style.backgroundSize = "cover";
}

function showForecastPlaceholders() {
  forecastList.style.display = "flex";
  forecastList.style.justifyContent = "space-between";
  forecastList.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const placeholder = document.createElement("div");
    placeholder.className = "forecast-item placeholder";
    placeholder.innerHTML = `<div class="centered-dash">-</div>`;
    forecastList.appendChild(placeholder);
  }
  showNoDataMessage();
}

function showNoDataMessage() {
  if (forecastChart) {
    forecastChart.destroy();
    forecastChart = null;
  }
  forecastChartCanvas.style.display = "none";

  if (!document.getElementById("noDataMessage")) {
    const noDataMessage = document.createElement("div");
    noDataMessage.id = "noDataMessage";
    noDataMessage.style.display = "flex";
    noDataMessage.style.justifyContent = "center";
    noDataMessage.style.alignItems = "center";
    noDataMessage.style.height = "100%";
    noDataMessage.style.fontSize = "1.5rem";
    noDataMessage.style.color = "#6366f1";
    noDataMessage.style.fontWeight = "bold";
    noDataMessage.textContent = "No Data";

    forecastGraphBox.appendChild(noDataMessage);
  } else {
    document.getElementById("noDataMessage").style.display = "flex";
  }
}

function setDefaultScreen() {
  locationElement.textContent = "Search for a city";
  temperatureElement.textContent = "-";
  descriptionElement.textContent = "Enter a city name above";
  weatherIcon.innerHTML = "🌤️";
  humidityElement.textContent = "Humidity: -";
  windElement.textContent = "Wind: -";
  showForecastPlaceholders();
  document.body.style.background = `url('${defaultBg}') no-repeat center center fixed`;
  document.body.style.backgroundSize = "cover";
}

setDefaultScreen();

searchButton.addEventListener("click", () => {
  const location = locationInput.value.trim();
  if (location) {
    showForecastPlaceholders();
    fetchWeather(location);
  }
});

locationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchButton.click();
});

function fetchWeather(location) {
  const url = `${apiUrl}?q=${encodeURIComponent(
    location
  )}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === 200) {
        locationElement.textContent = data.name;
        temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
        descriptionElement.textContent = data.weather[0].description;
        weatherIcon.innerHTML = getWeatherIcon(data.weather[0].main);

        humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
        windElement.textContent = `Wind: ${Math.round(
          data.wind.speed * 3.6
        )} km/h`;

        setWeatherBackground(data.weather[0].main);

        fetchForecast(data.coord.lat, data.coord.lon);
      } else {
        showError();
      }
    })
    .catch(showError);
}

function showError() {
  locationElement.textContent = "City not found";
  temperatureElement.textContent = "--°C";
  descriptionElement.textContent = "";
  weatherIcon.innerHTML = "❓";
  humidityElement.textContent = "Humidity: --%";
  windElement.textContent = "Wind: -- km/h";
  showForecastPlaceholders();
  document.body.style.background = `url('${defaultBg}') no-repeat center center fixed`;
  document.body.style.backgroundSize = "cover";
}

function fetchForecast(lat, lon) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(forecastUrl)
    .then((response) => response.json())
    .then((data) => {
      const daily = {};
      data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date] && item.dt_txt.includes("12:00:00")) {
          daily[date] = item;
        }
      });
      const days = Object.keys(daily).slice(0, 6);
      forecastData = days.map((date) => daily[date]);
      showListAndGraph();
    })
    .catch(() => {
      forecastList.innerHTML = "<div>Error loading forecast</div>";
      showNoDataMessage();
    });
}

function showListAndGraph() {
  forecastList.style.display = "flex";
  forecastList.innerHTML = "";
  if (!forecastData || forecastData.length === 0) {
    showNoDataMessage();
    return;
  }

  forecastData.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    forecastList.innerHTML += `
      <div class="forecast-item">
        <div>${date.substr(5)}</div>
        <div class="icon">${getWeatherIcon(item.weather[0].main)}</div>
        <div>${Math.round(item.main.temp)}°C</div>
        <div style="font-size:0.95em;">${item.weather[0].main}</div>
        <div style="font-size:0.95em;">💧${item.main.humidity}%</div>
        <div style="font-size:0.95em;">💨${Math.round(
          item.wind.speed * 3.6
        )} km/h</div>
      </div>
    `;
  });
  const noDataMessage = document.getElementById("noDataMessage");
  if (noDataMessage) {
    noDataMessage.style.display = "none";
  }

  forecastChartCanvas.style.display = "block";

  const labels = forecastData.map((item) => item.dt_txt.substr(5, 5));
  const temps = forecastData.map((item) => Math.round(item.main.temp));
  const humidities = forecastData.map((item) => item.main.humidity);
  const winds = forecastData.map((item) => Math.round(item.wind.speed * 3.6));
  const weatherTypes = forecastData.map((item) => item.weather[0].main);

  if (forecastChart) {
    forecastChart.destroy();
  }

  const ctx = forecastChartCanvas.getContext("2d");
  forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          fill: true,
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#3730a3",
            font: { size: 16, weight: "bold" },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          titleColor: "#3730a3",
          bodyColor: "#333",
          borderColor: "#6366f1",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 16,
            weight: "bold",
          },
          bodyFont: {
            size: 14,
          },
          callbacks: {
            title: function (context) {
              const idx = context[0].dataIndex;
              const item = forecastData[idx];
              if (!item) return "";

              const dateObj = new Date(item.dt_txt);
              const dayName = dateObj.toLocaleDateString("en-US", {
                weekday: "long",
              });
              const dateStr = labels[idx];
              return `${dayName} (${dateStr})`;
            },
            label: function (context) {
              const idx = context.dataIndex;
              const temp = temps[idx];
              const hum = humidities[idx];
              const wind = winds[idx];
              const weather = weatherTypes[idx];
              const weatherEmoji = getWeatherIcon(weather);

              return [
                `${weatherEmoji} ${weather}`,
                `🌡️ Temperature: ${temp}°C`,
                `💧 Humidity: ${hum}%`,
                `💨 Wind: ${wind} km/h`,
              ];
            },
            labelTextColor: function () {
              return "#333";
            },
          },
          displayColors: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: "#6366f1",
            font: { size: 12 },
          },
          title: {
            display: true,
            text: "°C",
            color: "#6366f1",
            font: { size: 13, weight: "bold" },
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
            color: "#6366f1",
            font: { size: 13, weight: "bold" },
          },
          ticks: {
            color: "#3730a3",
            font: { size: 12 },
            callback: function (label, index) {
              const item = forecastData[index];
              if (!item) return label;
              const dateObj = new Date(item.dt_txt);
              const dayName = dateObj.toLocaleDateString("en-US", {
                weekday: "short",
              });
              return label + "\n" + dayName;
            },
          },
        },
      },
    },
  });
}

function getWeatherIcon(main) {
  switch (main) {
    case "Clear":
      return "☀️";
    case "Clouds":
      return "☁️";
    case "Rain":
      return "🌧️";
    case "Drizzle":
      return "🌦️";
    case "Thunderstorm":
      return "⛈️";
    case "Snow":
      return "❄️";
    case "Mist":
      return "🌫️";
    case "Fog":
      return "🌫️";
    default:
      return "🌡️";
  }
}
