// script.js

// Function to fetch weather data from the API
async function getWeather() {
    const API_KEY = '7a4b2272c6e270912811f8853b05c3a7'; // Replace 'YOUR_API_KEY' with your actual API key
    const apiUrl = `https://api.example.com/weather?lat=33.44&lon=-94.04&appid=${API_KEY}`;

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

// Call the getWeather function when the page loads
window.onload = getWeather;
