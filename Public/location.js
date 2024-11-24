// Use your own OpenWeatherMap API Key below
const apiKey = 'f2c2661603d8f96757a81b3cfdd73892';

const error = document.getElementById('error');

const units = 'metric'; //can be imperial or metric
let temperatureSymobol = units == 'metric' ? "°C" : "°F";

        async function fetchWeather() {
            try {
                error.innerHTML = '';
        
                const cityInputtedByUser = document.getElementById('cityInput').value;
        
                // Build API URL
                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInputtedByUser}&appid=${apiKey}&units=${units}`;
        
                const response = await fetch(apiUrl);
                const data = await response.json();
        
                // Handle errors (invalid city, empty input, etc.)
                if (data.cod == '404') {
                    error.innerHTML = `City not found. Please check the spelling or try another city.`;
                    return;
                }
        
       
                // Display only the current temperature
                const temperature = data.main.temp;
        
            } catch (err) {
                console.log(err);
                error.innerHTML = `An error occurred. Please try again later.`;
            }
        }
        