// Default city
let currentCity = localStorage.getItem('weatherCity') || 'San Francisco';

// Load weather on page load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('city').value = currentCity;
    loadWeather();
});

async function updateLocation() {
    const cityInput = document.getElementById('city');
    currentCity = cityInput.value.trim();
    if (currentCity) {
        localStorage.setItem('weatherCity', currentCity);
        loadWeather();
    }
}

async function loadWeather() {
    const messageEl = document.getElementById('message');
    const detailsEl = document.getElementById('details');

    messageEl.innerHTML = '<span class="loading">Loading...</span>';
    detailsEl.innerHTML = '';

    try {
        // Get coordinates for the city
        const geoData = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(currentCity)}&count=1&language=en&format=json`
        ).then(res => res.json());

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Get weather data for today and yesterday
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        // Fetch weather data
        const weatherData = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&past_days=1`
        ).then(res => res.json());

        const yesterdayTemp = weatherData.daily.temperature_2m_max[0];
        const todayTemp = weatherData.daily.temperature_2m_max[1];

        const difference = Math.abs(todayTemp - yesterdayTemp);
        const comparison = todayTemp > yesterdayTemp ? 'warmer' :
                          todayTemp < yesterdayTemp ? 'colder' : 'the same';

        // Display the main message
        if (comparison === 'the same') {
            messageEl.innerHTML = `
                <div class="message-text">
                    Today is going to be <span class="comparison">the same</span> as yesterday.
                </div>
            `;
        } else {
            messageEl.innerHTML = `
                <div class="message-text">
                    Today is going to be <span class="comparison">${comparison}</span> than yesterday.
                </div>
            `;
        }

        // Display temperature details
        detailsEl.innerHTML = `
            <div>
                <span class="temp">Yesterday: ${Math.round(yesterdayTemp)}°F</span>
                <span style="margin: 0 15px;">•</span>
                <span class="temp">Today: ${Math.round(todayTemp)}°F</span>
                ${difference > 0 ? `<span style="margin: 0 15px;">•</span><span class="temp">${Math.round(difference)}° difference</span>` : ''}
            </div>
            <div style="margin-top: 10px; font-size: 1rem; opacity: 0.8;">
                ${name}${country ? `, ${country}` : ''}
            </div>
        `;

    } catch (error) {
        messageEl.innerHTML = `
            <div class="error">
                Oops! Couldn't load weather data.<br>
                <span style="font-size: 0.9rem;">Try a different city or check your connection.</span>
            </div>
        `;
        console.error('Error loading weather:', error);
    }
}

// Allow Enter key to update location
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.activeElement.id === 'city') {
        updateLocation();
    }
});
