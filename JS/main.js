// script.js

// Function to fetch weather data from the API
async function getWeather(lat, lon) {
    const API_KEY = '7a4b2272c6e270912811f8853b05c3a7'; // Replace 'YOUR_API_KEY' with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=${API_KEY}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data); // Log the data to the console to see its structure
        
        // Update the UI with weather information
        const weatherDiv = document.getElementById('weather');
        weatherDiv.innerHTML = `
            <h2>Current Weather</h2>
            <p>Temperature: ${data.current.temp} K</p>
            <p>Humidity: ${data.current.humidity}%</p>
            <p>Weather: ${data.current.weather[0].description}</p>
        `;
    } catch (error) {
        console.log('Error fetching weather data:', error);
    }
}



// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    const locationInput = document.getElementById('location').value;

    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${locationInput}&limit=1&appid=YOUR_API_KEY`);
        const data = await response.json();
        console.log(data); // Log the data to the console to see its structure

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

// Add event listener to the form for form submission
const locationForm = document.getElementById('location-form');
locationForm.addEventListener('submit', handleFormSubmit);
