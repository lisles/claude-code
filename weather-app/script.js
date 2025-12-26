// Default city and mode
let currentCity = localStorage.getItem('weatherCity') || '05255';
let currentMode = localStorage.getItem('weatherMode') || 'yesterday';

// Load weather on page load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('city').value = currentCity;

    // Set initial mode
    if (currentMode === 'future') {
        setMode('future', null, false);
    }

    loadWeather();
});

function setMode(mode, buttonElement = null, shouldReload = true) {
    currentMode = mode;
    localStorage.setItem('weatherMode', mode);

    // Update button styles
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to the appropriate button
    if (mode === 'future') {
        document.querySelectorAll('.mode-btn')[1].classList.add('active');
    } else {
        document.querySelectorAll('.mode-btn')[0].classList.add('active');
    }

    // Show/hide future selector
    const futureSelector = document.getElementById('futureSelector');
    if (mode === 'future') {
        futureSelector.style.display = 'block';
    } else {
        futureSelector.style.display = 'none';
    }

    if (shouldReload) {
        loadWeather();
    }
}

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

        if (currentMode === 'yesterday') {
            // Yesterday mode - compare today with yesterday
            const weatherData = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&past_days=1&forecast_days=2`
            ).then(res => res.json());

            const yesterdayTemp = weatherData.daily.temperature_2m_max[0];
            const todayTemp = weatherData.daily.temperature_2m_max[1];
            const todayLow = weatherData.daily.temperature_2m_min[1];
            const todayPrecip = weatherData.daily.precipitation_probability_max[1] || 0;
            const currentTemp = weatherData.current.temperature_2m;

            // Find times for today's high, low, and precipitation start
            const now = new Date();
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);

            let highTime = '';
            let lowTime = '';
            let precipStartTime = '';

            for (let i = 0; i < weatherData.hourly.time.length; i++) {
                const hourTime = new Date(weatherData.hourly.time[i]);
                if (hourTime >= todayStart && hourTime < todayEnd) {
                    if (Math.abs(weatherData.hourly.temperature_2m[i] - todayTemp) < 0.5 && !highTime) {
                        highTime = hourTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    }
                    if (Math.abs(weatherData.hourly.temperature_2m[i] - todayLow) < 0.5 && !lowTime) {
                        lowTime = hourTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    }
                    // Find first precipitation > 20% after current time
                    if (hourTime >= now && weatherData.hourly.precipitation_probability[i] > 20 && !precipStartTime) {
                        precipStartTime = hourTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    }
                }
            }

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
                <div style="margin-top: 10px; font-size: 1rem; opacity: 0.9;">
                    Currently ${Math.round(currentTemp)}°F
                </div>
                <div style="margin-top: 8px; font-size: 0.95rem; opacity: 0.85;">
                    Today's high is ${Math.round(todayTemp)}°F${highTime ? ` at ${highTime}` : ''} with a low of ${Math.round(todayLow)}°F${lowTime ? ` at ${lowTime}` : ''} and ${todayPrecip}% chance of precipitation${todayPrecip > 10 && precipStartTime ? ` starting at ${precipStartTime}` : ''}
                </div>
            `;

            // Update location display
            const locationEl = document.getElementById('location');
            if (locationEl) {
                locationEl.textContent = `${name}${country ? `, ${country}` : ''}`;
            }
        } else {
            // Future mode - compare future date with today
            const weatherData = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=8`
            ).then(res => res.json());

            const futureDayOffset = parseInt(document.getElementById('futureDay').value);
            const todayTemp = weatherData.daily.temperature_2m_max[0];
            const todayLow = weatherData.daily.temperature_2m_min[0];
            const todayPrecip = weatherData.daily.precipitation_probability_max[0] || 0;
            const currentTemp = weatherData.current.temperature_2m;
            const futureTemp = weatherData.daily.temperature_2m_max[futureDayOffset];

            // Find times for today's high, low, and precipitation start
            const now = new Date();
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);

            let highTime = '';
            let lowTime = '';
            let precipStartTime = '';

            for (let i = 0; i < weatherData.hourly.time.length; i++) {
                const hourTime = new Date(weatherData.hourly.time[i]);
                if (hourTime >= todayStart && hourTime < todayEnd) {
                    if (Math.abs(weatherData.hourly.temperature_2m[i] - todayTemp) < 0.5 && !highTime) {
                        highTime = hourTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    }
                    if (Math.abs(weatherData.hourly.temperature_2m[i] - todayLow) < 0.5 && !lowTime) {
                        lowTime = hourTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    }
                    // Find first precipitation > 20% after current time
                    if (hourTime >= now && weatherData.hourly.precipitation_probability[i] > 20 && !precipStartTime) {
                        precipStartTime = hourTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    }
                }
            }

            const difference = Math.abs(futureTemp - todayTemp);
            const comparison = futureTemp > todayTemp ? 'warmer' :
                              futureTemp < todayTemp ? 'colder' : 'the same';

            // Get day name for the future date
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + futureDayOffset);
            const dayName = futureDate.toLocaleDateString('en-US', { weekday: 'long' });

            // Display the main message
            if (comparison === 'the same') {
                messageEl.innerHTML = `
                    <div class="message-text">
                        <span class="comparison">${dayName}</span> is going to be the same as today.
                    </div>
                `;
            } else {
                messageEl.innerHTML = `
                    <div class="message-text">
                        <span class="comparison">${dayName}</span> is going to be <span class="comparison">${comparison}</span> than today.
                    </div>
                `;
            }

            // Display temperature details
            detailsEl.innerHTML = `
                <div>
                    <span class="temp">Today: ${Math.round(todayTemp)}°F</span>
                    <span style="margin: 0 15px;">•</span>
                    <span class="temp">${dayName}: ${Math.round(futureTemp)}°F</span>
                    ${difference > 0 ? `<span style="margin: 0 15px;">•</span><span class="temp">${Math.round(difference)}° difference</span>` : ''}
                </div>
                <div style="margin-top: 10px; font-size: 1rem; opacity: 0.9;">
                    Currently ${Math.round(currentTemp)}°F
                </div>
                <div style="margin-top: 8px; font-size: 0.95rem; opacity: 0.85;">
                    Today's high is ${Math.round(todayTemp)}°F${highTime ? ` at ${highTime}` : ''} with a low of ${Math.round(todayLow)}°F${lowTime ? ` at ${lowTime}` : ''} and ${todayPrecip}% chance of precipitation${todayPrecip > 10 && precipStartTime ? ` starting at ${precipStartTime}` : ''}
                </div>
            `;

            // Update location display
            const locationEl = document.getElementById('location');
            if (locationEl) {
                locationEl.textContent = `${name}${country ? `, ${country}` : ''}`;
            }
        }

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
