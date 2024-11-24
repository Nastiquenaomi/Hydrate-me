
const error = document.getElementById('error');



        async function fetchWeather() {
            try {
                error.innerHTML = '';
        
                const cityInputtedByUser = document.getElementById('cityInput').value;
        
                // Build API URL
                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInputtedByUser}&appid=${apiKey}&units=metric`;
        
                const response = await fetch(apiUrl);
                const data = await response.json();
        
                // Handle errors (invalid city, empty input, etc.)
                if (data.cod == '404') {
                    error.innerHTML = `City not found. Please check the spelling or try another city.`;
                    return;
                }
        
       
                // Display only the current temperature
                const temperature = data.main.temp;
            
                // Send temperature to the server
                await fetch('/set-temperature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temperature })
                });

                console.log(`Temperature sent to the server: ${temperature}`);
  
        
            } catch (err) {
                console.log(err);
                error.innerHTML = `An error occurred. Please try again later.`;
            }
        }
        