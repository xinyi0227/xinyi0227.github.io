
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
        const sunriseTime = new Date(data.current.sunrise * 1000).toLocaleTimeString();
        const sunsetTime = new Date(data.current.sunset * 1000).toLocaleTimeString();
        sunriseSunsetSection.innerHTML = `
            <p>Sunrise: ${sunriseTime}</p>
            <p>Sunset: ${sunsetTime}</p>
        `;

        // Additional Weather Details Section
        const additionalDetailsSection = document.getElementById('additional-details-info');
        additionalDetailsSection.innerHTML = `
            <p>Pressure: ${data.current.pressure} hPa</p>
            <p>Visibility: ${data.current.visibility} meters</p>
            <p>Wind Speed: ${data.current.wind_speed} m/s</p>
        `;





        // Hourly Forecast Section
        // Get the hourly tab container by ID
        const hourlyTabContainer = document.getElementById('hourly-tab');
        // Get the hourly details container by ID
        const hourlyDetailsContainer = document.getElementById('hourly-details-container');

        // Create tabs for the next 24 hours
        const now = new Date();
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now.getTime() + i * 3600 * 1000);
            const hourTime = hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const button = document.createElement('button');
            button.textContent = hourTime;
            button.dataset.index = i; // Assign a unique data-index attribute
            hourlyTabContainer.appendChild(button);
        }

        // Event listener for hourly tabs
        hourlyTabContainer.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON') {
                const index = event.target.dataset.index;
                const selectedHour = new Date(now.getTime() + index * 3600 * 1000);
                // Assuming `data` is defined elsewhere, you should replace it with your actual data source.
                showHourlyDetails(selectedHour, data.hourly);
            }
        });

        // Function to show hourly details for the selected hour
        function showHourlyDetails(hour, hourlyData) {
            const selectedHour = hour.getHours();

            // Find the data corresponding to the selected hour
            const hourDetails = hourlyData.find(data => {
                const dataHour = new Date(data.dt * 1000).getHours();
                return dataHour === selectedHour;
            });

            if (hourDetails) {
                hourlyDetailsContainer.innerHTML = '';

                // Show details for the selected hour
                const hourTime = new Date(hourDetails.dt * 1000).toLocaleTimeString();
                const div = document.createElement('div');
                div.classList.add('hourly-forecast-item');
                div.innerHTML = `
                    <p>Time: ${hourTime}</p>
                    <p>Temperature: ${hourDetails.temp} K</p>
                    <p>Weather: ${hourDetails.weather[0].description}</p>
                    <img src="http://openweathermap.org/img/w/${hourDetails.weather[0].icon}.png" alt="Weather Icon" class="weather-icon">
                `;
                hourlyDetailsContainer.appendChild(div);
            } else {
                console.log('No weather information available for the selected hour.');
            }
        }








        // Daily Forecast Section
        const dailyForecastSection = document.getElementById('daily-forecast-info');
        dailyForecastSection.innerHTML = '';
        data.daily.forEach(day => {
            const dayDate = new Date(day.dt * 1000).toDateString();
            dailyForecastSection.innerHTML += `
                <div>
                    <p>Date: ${dayDate}</p>
                    <p>Temperature: ${day.temp.day} K</p>
                    <p>Weather: ${day.weather[0].description}</p>
                    <img src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="Weather Icon" class="weather-icon">
                </div>
            `;
        });
    } catch (error) {
        console.log('Error fetching weather data:', error);
    }
}

