// Weather Dashboard - Simple & Working Version
class WeatherDashboard {
    constructor() {
        // Get configuration
        this.config = window.WeatherConfig || {};
        
        // Get API key (priority: config > localStorage > prompt)
        this.apiKey = this.getApiKey();
        
        // Default settings
        this.currentCity = this.config.defaultCity || 'London';
        this.units = this.config.units || 'metric';
        
        // Initialize
        this.init();
    }
    
    getApiKey() {
        console.log('🔑 Looking for API key...');
        console.log('Config:', this.config);
        
        // 1. First try config (set by build process)
        if (this.config.apiKey && this.config.apiKey.length > 20) {
            console.log('✅ Using API key from config');
            return this.config.apiKey;
        }
        
        // 2. Try localStorage (user saved)
        const savedKey = localStorage.getItem('weatherApiKey');
        if (savedKey && savedKey.length > 20) {
            console.log('✅ Using API key from localStorage');
            return savedKey;
        }
        
        // 3. No key found
        console.log('⚠️ No API key found. Running in demo mode.');
        console.log('ℹ️ Add your API key to .env file or enter it when prompted.');
        return null;
    }
    
    init() {
        console.log('🌤️ Weather Dashboard Initialized');
        console.log('📍 Default city:', this.currentCity);
        console.log('🔑 API key:', this.apiKey ? 'Available' : 'Not available (demo mode)');
        
        // Get DOM elements
        this.getElements();
        
        // Setup event listeners
        this.setupEvents();
        
        // Load initial weather
        this.loadWeather();
        
        // Check if we need to prompt for API key
        if (!this.apiKey && this.config.isLocal) {
            this.promptForApiKey();
        }
    }
    
    getElements() {
        this.elements = {
            cityInput: document.getElementById('city-input'),
            searchBtn: document.getElementById('search-btn'),
            useLocationBtn: document.getElementById('use-location-btn'),
            cityName: document.getElementById('city-name'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feels-like'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('wind-speed'),
            pressure: document.getElementById('pressure'),
            weatherDescription: document.getElementById('weather-description'),
            weatherIcon: document.getElementById('weather-icon'),
            forecastContainer: document.getElementById('forecast-container'),
            lastUpdated: document.getElementById('last-updated')
        };
    }
    
    setupEvents() {
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => this.searchWeather());
        }
        
        if (this.elements.cityInput) {
            this.elements.cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchWeather();
            });
        }
        
        if (this.elements.useLocationBtn) {
            this.elements.useLocationBtn.addEventListener('click', () => this.useGeolocation());
        }
    }
    
    promptForApiKey() {
        setTimeout(() => {
            const key = prompt(
                '🔑 Enter OpenWeatherMap API Key\n\n' +
                'Get a free key from:\nhttps://openweathermap.org/api\n\n' +
                'Or click Cancel to use demo mode.'
            );
            
            if (key && key.trim()) {
                this.apiKey = key.trim();
                localStorage.setItem('weatherApiKey', this.apiKey);
                console.log('✅ API key saved to localStorage');
                this.showMessage('API key saved! Loading real weather data...', 'success');
                this.loadWeather();
            }
        }, 1000);
    }
    
    async loadWeather() {
        try {
            if (this.apiKey) {
                await this.fetchRealWeather(this.currentCity);
            } else {
                this.useDemoData(this.currentCity);
                this.showMessage('Running in demo mode. Add API key for real weather data.', 'info');
            }
        } catch (error) {
            console.error('Error loading weather:', error);
            this.useDemoData(this.currentCity);
        }
    }
    
    async fetchRealWeather(city) {
        try {
            console.log(`🌍 Fetching real weather for: ${city}`);
            
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${this.units}&appid=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            this.updateWeatherDisplay(data);
            this.showMessage('Real weather data loaded!', 'success');
            
            // Also fetch forecast
            this.fetchForecast(city);
            
        } catch (error) {
            console.error('Real weather fetch failed:', error);
            this.showMessage('Could not fetch real weather. Using demo data.', 'error');
            this.useDemoData(city);
        } finally {
            this.updateLastUpdated();
        }
    }
    
    async fetchForecast(city) {
        if (!this.apiKey || !this.elements.forecastContainer) return;
        
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${this.units}&appid=${this.apiKey}`
            );
            
            if (response.ok) {
                const data = await response.json();
                this.updateForecastDisplay(data);
            }
        } catch (error) {
            console.log('Forecast fetch failed, using demo');
            this.useDemoForecast();
        }
    }
    
    updateWeatherDisplay(data) {
        if (!data || !data.main) return;
        
        const elements = this.elements;
        
        if (elements.cityName) elements.cityName.textContent = `${data.name}, ${data.sys?.country || ''}`;
        if (elements.temperature) elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        if (elements.feelsLike) elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        if (elements.humidity) elements.humidity.textContent = `${data.main.humidity}%`;
        if (elements.windSpeed) elements.windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        if (elements.pressure) elements.pressure.textContent = `${data.main.pressure} hPa`;
        
        if (data.weather?.[0]) {
            const weather = data.weather[0];
            if (elements.weatherDescription) elements.weatherDescription.textContent = weather.description;
            if (elements.weatherIcon) {
                elements.weatherIcon.className = `fas ${this.getWeatherIcon(weather.icon)}`;
                elements.weatherIcon.style.color = this.getIconColor(weather.icon);
            }
            this.updateBackground(weather.main);
        }
    }
    
    updateForecastDisplay(data) {
        const container = this.elements.forecastContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        // Show next 5 forecast entries
        const forecasts = data.list?.slice(0, 5) || [];
        
        forecasts.forEach(item => {
            const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit' });
            const card = document.createElement('div');
            card.className = 'forecast-day';
            card.innerHTML = `
                <div class="time">${time}</div>
                <i class="fas ${this.getWeatherIcon(item.weather[0]?.icon)}" 
                   style="color: ${this.getIconColor(item.weather[0]?.icon)}"></i>
                <div class="temp">${Math.round(item.main.temp)}°C</div>
                <div class="description">${item.weather[0]?.description || ''}</div>
            `;
            container.appendChild(card);
        });
    }
    
    useDemoData(city) {
        console.log('Using demo data for:', city);
        
        const temp = this.getCityTemperature(city);
        const weather = this.getCityWeather(city);
        
        const elements = this.elements;
        
        if (elements.cityName) elements.cityName.textContent = city;
        if (elements.temperature) elements.temperature.textContent = `${temp}°C`;
        if (elements.feelsLike) elements.feelsLike.textContent = `${temp - 2}°C`;
        if (elements.humidity) elements.humidity.textContent = `${Math.floor(Math.random() * 30) + 50}%`;
        if (elements.windSpeed) elements.windSpeed.textContent = `${Math.floor(Math.random() * 20) + 5} km/h`;
        if (elements.pressure) elements.pressure.textContent = `${Math.floor(Math.random() * 50) + 1000} hPa`;
        if (elements.weatherDescription) elements.weatherDescription.textContent = weather;
        if (elements.weatherIcon) {
            elements.weatherIcon.className = 'fas fa-cloud-sun';
            elements.weatherIcon.style.color = '#fbbf24';
        }
        
        this.useDemoForecast();
    }
    
    useDemoForecast() {
        const container = this.elements.forecastContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        const times = ['Now', '15:00', '18:00', '21:00', '00:00'];
        
        times.forEach((time, index) => {
            const temp = 18 + Math.floor(Math.random() * 8);
            const card = document.createElement('div');
            card.className = 'forecast-day';
            card.innerHTML = `
                <div class="time">${time}</div>
                <i class="fas fa-cloud-sun" style="color: #fbbf24"></i>
                <div class="temp">${temp}°C</div>
                <div class="description">Partly cloudy</div>
            `;
            container.appendChild(card);
        });
    }
    
    // Helper methods (keep your existing ones)
    getCityTemperature(city) {
        const temps = { 'London': 15, 'Paris': 18, 'New York': 20, 'Tokyo': 22 };
        return temps[city] || 20;
    }
    
    getCityWeather(city) {
        const weathers = {
            'London': 'Cloudy with occasional rain',
            'Paris': 'Partly cloudy',
            'New York': 'Sunny',
            'Tokyo': 'Clear skies'
        };
        return weathers[city] || 'Partly cloudy';
    }
    
    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fa-sun', '02d': 'fa-cloud-sun', '03d': 'fa-cloud', '04d': 'fa-cloud',
            '09d': 'fa-cloud-rain', '10d': 'fa-cloud-sun-rain', '11d': 'fa-bolt',
            '13d': 'fa-snowflake', '50d': 'fa-smog'
        };
        return iconMap[iconCode] || 'fa-question';
    }
    
    getIconColor(iconCode) {
        const colorMap = {
            '01d': '#f59e0b', '02d': '#fbbf24', '03d': '#94a3b8', '04d': '#64748b',
            '09d': '#3b82f6', '10d': '#60a5fa', '11d': '#8b5cf6', '13d': '#93c5fd'
        };
        return colorMap[iconCode] || '#4f46e5';
    }
    
    updateBackground(weatherType) {
        const gradientMap = {
            'Clear': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'Clouds': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            'Rain': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            'Snow': 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)'
        };
        document.body.style.background = gradientMap[weatherType] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    searchWeather() {
        const city = this.elements.cityInput?.value?.trim();
        if (city) {
            this.currentCity = city;
            this.loadWeather();
        }
    }
    
    useGeolocation() {
        if (!navigator.geolocation) {
            this.showMessage('Geolocation not supported', 'error');
            return;
        }
        
        this.showMessage('Getting your location...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.currentCity = `Location (${latitude.toFixed(1)}, ${longitude.toFixed(1)})`;
                if (this.elements.cityInput) {
                    this.elements.cityInput.value = this.currentCity;
                }
                this.loadWeather();
            },
            (error) => {
                this.showMessage(`Location error: ${error.message}`, 'error');
            }
        );
    }
    
    showMessage(text, type = 'info') {
        console.log(`${type}: ${text}`);
        
        // Remove existing
        const existing = document.querySelector('.status-message');
        if (existing) existing.remove();
        
        // Create new
        const div = document.createElement('div');
        div.className = `status-message ${type}`;
        div.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
        
        const container = document.querySelector('.search-section');
        if (container) {
            container.prepend(div);
            setTimeout(() => div.remove(), 5000);
        }
    }
    
    updateLastUpdated() {
        if (this.elements.lastUpdated) {
            this.elements.lastUpdated.textContent = new Date().toLocaleTimeString();
        }
    }
}

// Start when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting Weather Dashboard...');
    new WeatherDashboard();
});