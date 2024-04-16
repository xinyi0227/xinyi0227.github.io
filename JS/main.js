
function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
  }

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {

        const targetId = button.dataset.target;
        const targetSection = document.getElementById(targetId);

        tabContents.forEach(content => {
            content.style.display = 'none';
        });

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
        console.log(data); 

        // Current Weather Section
        const currentWeatherSection = document.getElementById('current-weather-info');
        const temperatureKelvin = data.current.temp;
        const temperatureCelsius = kelvinToCelsius(temperatureKelvin).toFixed(2);
        
        currentWeatherSection.innerHTML = `
            <div class="weather-container">
                <div id="current-weather-info" class="weather-info">
                    <div>
                        <p>Temperature: ${temperatureKelvin} K (${temperatureCelsius} °C)</p>
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

            const sunriseTime = new Date(data.current.sunrise * 1000).toLocaleTimeString();
            const sunsetTime = new Date(data.current.sunset * 1000).toLocaleTimeString();

            sunriseSunsetSection.innerHTML = `
                <p>Sunrise: ${sunriseTime}</p>
                <p>Sunset: ${sunsetTime}</p>
            `;
        } else {

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

        const hourlyTabContainer = document.getElementById('hourly-tab');

        const now = new Date();
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now.getTime() + i * 3600 * 1000);
            const hourTime = hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const button = document.createElement('button');
            button.textContent = hourTime;
            button.dataset.hourIndex = i; 
            hourlyTabContainer.appendChild(button);

            const detailsContainer = document.createElement('div');
            detailsContainer.classList.add('hourly-details');
            detailsContainer.id = 'hourly-details-' + i;
            hourlyTabContainer.appendChild(detailsContainer);
        }

        hourlyTabContainer.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {

                document.querySelectorAll('.hourly-tab button').forEach(btn => {
                    btn.classList.remove('active');
                });

                event.target.classList.add('active');

                const hourIndex = event.target.dataset.hourIndex;
                const selectedHour = new Date(now.getTime() + hourIndex * 3600 * 1000);
                showHourlyDetails(selectedHour, data.hourly[hourIndex]);

                document.getElementById('hourly-details-container').style.display = 'block';
            }
        });

        const dailyTabContainer = document.getElementById('daily-tab');
        dailyTabContainer.innerHTML = ''; 

        for (let i = 0; i < 7; i++) {
            const day = new Date(data.daily[i].dt * 1000);
            const dayDate = day.toDateString();

            const button = document.createElement('button');
            button.textContent = dayDate;
            button.dataset.dayIndex = i; 
            dailyTabContainer.appendChild(button);

            const detailsContainer = document.createElement('div');
            detailsContainer.classList.add('daily-details');
            detailsContainer.id = 'daily-details-' + i;
            dailyTabContainer.appendChild(detailsContainer);
        }

        // Event listener for daily tabs using event delegation
        dailyTabContainer.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {

                document.querySelectorAll('#daily-tab button').forEach(btn => {
                    btn.classList.remove('active');
                });


                event.target.classList.add('active');

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



