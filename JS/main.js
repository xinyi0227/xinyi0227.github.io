// Function to convert Kelvin to Celsius
function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
  }

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Get the target section based on data-target attribute
        const targetId = button.dataset.target;
        const targetSection = document.getElementById(targetId);

        // Hide all tab contents
        tabContents.forEach(content => {
            content.style.display = 'none';
        });

        // Show the target tab content
        targetSection.style.display = 'block';
    });
});

const locationForm = document.getElementById('location-form');
locationForm.addEventListener('submit', handleFormSubmit);

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    const locationInput = document.getElementById('location').value;

    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${locationInput}&limit=1&appid=4434eafdf444c726a6c19b494ca335f8`);
        const data = await response.json();
        console.log(data);

        if (data.length > 0) {
            const { lat, lon } = data[0];
            getWeather(lat, lon);
        } else {
            console.log('Location not found');
        }
    } catch (error) {
        console.log('Error fetching location data:', error);
    }
}

// Function to fetch weather data from the API
async function getWeather(lat, lon) {
    const API_KEY = '4434eafdf444c726a6c19b494ca335f8';
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_KEY}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data); // Log the data to the console to see its structure

        // Update the UI with weather information
        // Current Weather Section
        const currentWeatherSection = document.getElementById('current-weather-info');
        currentWeatherSection.innerHTML = `
            <div class="weather-container">
                <div id="current-weather-info" class="weather-info">
                    <div>
                        <p>Temperature: ${data.current.temp} K</p>
                        <p>Humidity: ${data.current.humidity}%</p>
                        <p>Weather: ${data.current.weather[0].description}</p>
                    </div>
                    <img src="http://openweathermap.org/img/w/${data.current.weather[0].icon}.png" alt="Weather Icon" class="weather-icon">
                </div>
            </div>
        `;

        // Sunrise and Sunset Section
        const sunriseSunsetSection = document.getElementById('sunrise-sunset-info');

        if (data.current.sunrise && data.current.sunset) {
            // Sunrise and sunset times are provided
            const sunriseTime = new Date(data.current.sunrise * 1000).toLocaleTimeString();
            const sunsetTime = new Date(data.current.sunset * 1000).toLocaleTimeString();

            sunriseSunsetSection.innerHTML = `
                <p>Sunrise: ${sunriseTime}</p>
                <p>Sunset: ${sunsetTime}</p>
            `;
        } else {
            // Sunrise and sunset times are not applicable
            sunriseSunsetSection.innerHTML = `
                <p>Sunrise and sunset times are not applicable for this location.</p>
            `;
        }

        // Additional Weather Details Section
        const additionalDetailsSection = document.getElementById('additional-details-info');
        additionalDetailsSection.innerHTML = `
            <p>Pressure: ${data.current.pressure} hPa</p>
            <p>Visibility: ${data.current.visibility} meters</p>
            <p>Wind Speed: ${data.current.wind_speed} m/s</p>
            <p>UV Index: ${data.current.uvi} </p>
        `;

        // Get the hourly tab container by ID
        const hourlyTabContainer = document.getElementById('hourly-tab');

        // Create tabs for the next 24 hours
        const now = new Date();
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now.getTime() + i * 3600 * 1000);
            const hourTime = hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const button = document.createElement('button');
            button.textContent = hourTime;
            button.dataset.hourIndex = i; // Add a custom data attribute to store the hour index
            hourlyTabContainer.appendChild(button);

            const detailsContainer = document.createElement('div');
            detailsContainer.classList.add('hourly-details');
            detailsContainer.id = 'hourly-details-' + i;
            hourlyTabContainer.appendChild(detailsContainer);
        }

        // Event listener for hourly tabs using event delegation
        hourlyTabContainer.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                // Remove 'active' class from all buttons
                document.querySelectorAll('.hourly-tab button').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Add 'active' class to the clicked button
                event.target.classList.add('active');

                // Get the hour index from the custom data attribute
                const hourIndex = event.target.dataset.hourIndex;
                const selectedHour = new Date(now.getTime() + hourIndex * 3600 * 1000);
                showHourlyDetails(selectedHour, data.hourly[hourIndex]);

                // Show the hourly-details-container
                document.getElementById('hourly-details-container').style.display = 'block';
            }
        });

        // Create tabs for the daily forecast
        const dailyTabContainer = document.getElementById('daily-tab');
        dailyTabContainer.innerHTML = ''; // Clear previous content

        for (let i = 0; i < 7; i++) {
            const day = new Date(data.daily[i].dt * 1000);
            const dayDate = day.toDateString();

            const button = document.createElement('button');
            button.textContent = dayDate;
            button.dataset.dayIndex = i; // Add a custom data attribute to store the day index
            dailyTabContainer.appendChild(button);

            const detailsContainer = document.createElement('div');
            detailsContainer.classList.add('daily-details');
            detailsContainer.id = 'daily-details-' + i;
            dailyTabContainer.appendChild(detailsContainer);
        }

        // Event listener for daily tabs using event delegation
        dailyTabContainer.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                // Remove 'active' class from all buttons
                document.querySelectorAll('#daily-tab button').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Add 'active' class to the clicked button
                event.target.classList.add('active');

                // Get the day index from the custom data attribute
                const dayIndex = event.target.dataset.dayIndex;
                showDailyDetails(data.daily[dayIndex]);
            }
        });
    } catch (error) {
        console.log('Error fetching weather data:', error);
    }
}

// Function to show hourly details for the selected hour
function showHourlyDetails(hour, hourlyData) {
    const selectedHour = hour.getHours();
    const selectedDate = hour.toDateString();

    const hourlyDetailsContainer = document.getElementById('hourly-details-container');
    hourlyDetailsContainer.innerHTML = ''; // Clear previous content

    // Show details for the selected hour
    const hourTime = hour.toLocaleTimeString();
    const temperatureKelvin = hourlyData.temp;
    const temperatureCelsius = kelvinToCelsius(temperatureKelvin).toFixed(2);
    const weatherDescription = hourlyData.weather[0].description;

    const div = document.createElement('div');
    div.classList.add('hourly-forecast-item');
    div.innerHTML = `
        <div>
            <p>Date: ${selectedDate}</p>
            <p>Time: ${hourTime}</p>
            <p>Temperature: ${temperatureKelvin} K (${temperatureCelsius} °C)</p>
            <p>Weather: ${weatherDescription}</p>
        </div>
        <img src="http://openweathermap.org/img/w/${hourlyData.weather[0].icon}.png" alt="Weather Icon" class="weather-icon">
    `;
    hourlyDetailsContainer.appendChild(div);
}

// Function to show daily details for the selected day
function showDailyDetails(dailyData) {
    const dailyDetailsContainer = document.getElementById('daily-details-container');
    dailyDetailsContainer.innerHTML = ''; // Clear previous content

    // Show details for the selected day
    const dayDate = new Date(dailyData.dt * 1000).toDateString();
    const temperatureKelvin = dailyData.temp.day;
    const temperatureCelsius = kelvinToCelsius(temperatureKelvin).toFixed(2);
    const weatherDescription = dailyData.weather[0].description;

    const div = document.createElement('div');
    div.classList.add('daily-forecast-item');
    div.innerHTML = `
        <div>
            <p>Date: ${dayDate}</p>
            <p>Temperature: ${temperatureKelvin} K (${temperatureCelsius} °C)</p>
            <p>Weather: ${weatherDescription}</p>
        </div>
        <img src="http://openweathermap.org/img/w/${dailyData.weather[0].icon}.png" alt="Weather Icon" class="weather-icon">
    `;
    dailyDetailsContainer.appendChild(div);
}



