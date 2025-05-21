const api_key = '2ef7a2b3a52b4e7fadc174847250304';

document.querySelector(".search_icon").addEventListener('click', fetchWeather);
// document.getElementById('city').addEventListener('keypress', function(event) {
// if (event.key === 'Enter') {
//     fetchWeather();
// }
// });
async function fetchCityName() {
    const in_city = document.getElementById('city').value;
    const searchResults = document.querySelector('.search-results');
    
    if (in_city.length < 3) {
        searchResults.innerHTML = '';
        return;
    }

    try {
        let URL = `https://api.weatherapi.com/v1/search.json?key=${api_key}&q=${in_city}`;
        const response = await fetch(URL);
        const data = await response.json();
        
        // Clear previous results
        searchResults.innerHTML = '';
        
        // Add new results
        data.forEach(city => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `${city.name}, ${city.country}`;
            
            // Add click event to each result
            resultItem.addEventListener('click', () => {
                document.getElementById('city').value = city.name;
                searchResults.innerHTML = ''; // Clear results after selection
                fetchWeather(); // Call the weather fetch function
            });
            
            searchResults.appendChild(resultItem);
        });
    } catch (error) {
        console.error("Error fetching cities:", error);
    }
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add event listener with debouncing
document.getElementById('city').addEventListener('input', debounce(fetchCityName, 300));

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) {
        document.querySelector('.search-results').innerHTML = '';
    }
});

function formatDate(dateString) {
    const datePart = dateString.split(' ')[0];
    const [year, month, day] = datePart.split('-');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[parseInt(month) - 1];
    return `${day} ${monthName} ${year}`;
}

function formatTime(timeString) {
    // Convert "HH:mm" to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // Convert 0 to 12
    return `${hour} ${ampm}`;
}

function getWeatherRecommendations(temp, condition, uvIndex) {
    let recommendations = [];
    
    // Temperature-based recommendations
    if (temp > 30) {
        recommendations.push({
            icon: '🌡️',
            text: "Stay hydrated and avoid prolonged sun exposure"
        });
        recommendations.push({
            icon: '👕',
            text: "Wear light, breathable clothing"
        });
    } else if (temp < 10) {
        recommendations.push({
            icon: '🧥',
            text: "Wear warm clothing and layer up"
        });
        recommendations.push({
            icon: '🧤',
            text: "Consider using hand warmers if outside for long"
        });
    }
    
    // UV Index recommendations
    if (uvIndex >= 8) {
        recommendations.push({
            icon: '☀️',
            text: "Very high UV index - use SPF 50+ sunscreen"
        });
        recommendations.push({
            icon: '⛱️',
            text: "Seek shade during peak hours (10 AM - 4 PM)"
        });
    } else if (uvIndex >= 6) {
        recommendations.push({
            icon: '🧴',
            text: "High UV index - use SPF 30+ sunscreen"
        });
    }
    
    // Weather condition recommendations
    if (condition.toLowerCase().includes('rain')) {
        recommendations.push({
            icon: '☔',
            text: "Carry an umbrella or raincoat"
        });
        recommendations.push({
            icon: '👞',
            text: "Be careful on wet surfaces"
        });
    } else if (condition.toLowerCase().includes('snow')) {
        recommendations.push({
            icon: '❄️',
            text: "Wear appropriate footwear for snow"
        });
        recommendations.push({
            icon: '⚠️',
            text: "Be cautious of icy conditions"
        });
    } else if (condition.toLowerCase().includes('wind')) {
        recommendations.push({
            icon: '💨',
            text: "Secure loose objects"
        });
        recommendations.push({
            icon: '🧥',
            text: "Consider wearing wind-resistant clothing"
        });
    }
    
    return recommendations;
}

function updateWeatherDetails(data) {
    // Update feels like temperature
    const feelsLike = Math.round(data.current.feelslike_c);
    document.querySelector('.feels-like').textContent = `${feelsLike}°C`;
    
    // Update UV index
    const uvIndex = data.current.uv;
    document.querySelector('.uv-index').textContent = uvIndex;
    
    // Update visibility
    const visibility = data.current.vis_km;
    document.querySelector('.visibility').textContent = `${visibility} km`;
    
    // Update air quality
    const airQuality = data.current.air_quality ? data.current.air_quality['us-epa-index'] : 'N/A';
    document.querySelector('.air-quality').textContent = airQuality;
    
    // Get and update recommendations
    const recommendations = getWeatherRecommendations(
        data.current.temp_c,
        data.current.condition.text,
        data.current.uv
    );
    
    // Update recommendations UI
    const recommendationContent = document.querySelector('.recommendation-content');
    recommendationContent.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <span class="recommendation-icon">${rec.icon}</span>
            <p class="recommendation-text">${rec.text}</p>
        </div>
    `).join('');
}

async function fetchWeather() {
    const city = document.getElementById('city').value;
    let url = `https://api.weatherapi.com/v1/forecast.json?key=2ef7a2b3a52b4e7fadc174847250304&q=${city}&days=01&aqi=yes`;
    
    try {
        // Add loading state
        document.querySelector('.container').classList.add('loading');
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Remove loading state
        document.querySelector('.container').classList.remove('loading');
        
        // Update current weather
        const Date_string = data.location.localtime;
        const formattedDate = formatDate(Date_string);
        const location = data.location.name;
        const temp_C = Math.ceil(data.current.temp_c);
        const Condition = data.current.condition.text;
        const Humidity = data.current.humidity;
        const Wind = Math.floor(data.current.wind_kph);
        const rain = data.current.precip_mm;

        // Update DOM for current weather
        document.querySelector(".city").innerHTML = `${location}`;
        document.querySelector(".temperature").innerHTML = `${temp_C}°C`;
        document.querySelector(".wind").innerHTML = `${Wind} km/h`;
        document.querySelector(".humidity").innerHTML = `${Humidity}%`;
        document.querySelector(".condition").innerHTML = `${Condition}`;
        document.querySelector(".Rain").innerHTML = `${rain} mm`;
        document.querySelector(".date").innerHTML = `${formattedDate}`;

        // Update weather details and recommendations
        updateWeatherDetails(data);

        // Update weather icon based on condition
        updateWeatherIcon(Condition);

        // Get hourly forecast data
        const currentHour = new Date().getHours();
        const hourlyData = data.forecast.forecastday[0].hour;

        // Display next 4 hours
        for(let i = 1; i <= 4; i++) {
            const nextHourIndex = (currentHour + i) % 24;
            const hourData = hourlyData[nextHourIndex];
            const hourTemp = Math.round(hourData.temp_c);
            const hourTime = hourData.time.split(' ')[1];
            const formattedTime = formatTime(hourTime);
            
            document.querySelector(`.hour-${i}`).innerHTML = formattedTime;
            document.querySelector(`.hour-${i}-temp`).innerHTML = `${hourTemp}°C`;
        }

    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.querySelector('.container').classList.remove('loading');
    }
}

function updateWeatherIcon(condition) {
    const conditionImage = document.querySelector(".condition-image");
    let iconPath = '';
    
    if (condition.includes("Sunny") || condition.includes("Clear")) {
        iconPath = './assets/Ellipse 83.svg';
    } else if (condition.includes("Partly cloudy") || condition.includes("Cloudy") || condition.includes("Overcast")) {
        iconPath = './assets/Group 37.svg';
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
        iconPath = './assets/Group 38.svg';
    } else if (condition.includes("thunder")) {
        iconPath = './assets/Group 40.svg';
    } else {
        iconPath = './assets/Group 37.svg'; // Default icon
    }
    
    conditionImage.innerHTML = `<img src="${iconPath}" alt="${condition}">`;
}
