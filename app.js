// Weather Dashboard with REAL OpenWeatherMap API
class WeatherDashboard {
    constructor() {
        // API Configuration
        this.apiKey = ''; // Will be set from environment or input
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        
        // Default city
        this.currentCity = 'London';
        this.units = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
        
        // DOM Elements
        this.elements = {
            // Inputs
            cityInput: document.getElementById('city-input'),
            searchBtn: document.getElementById('search-btn'),
            useLocationBtn: document.getElementById('use-location-btn'),
            
            // Current Weather Display
            cityName: document.getElementById('city-name'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feels-like'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('wind-speed'),
            pressure: document.getElementById('pressure'),
            weatherDescription: document.getElementById('weather-description'),
            weatherIcon: document.getElementById('weather-icon'),
            
            // Forecast
            forecastContainer: document.getElementById('forecast-container'),
            
            // Info Display
            lastUpdated: document.getElementById('last-updated'),
            commitHash: document.getElementById('commit-hash'),
            deployTime: document.getElementById('deploy-time'),
            
            // CI/CD Info
            buildNumber: document.getElementById('build-number'),
            runnerInfo: document.getElementById('runner-info'),
            repoLink: document.getElementById('repo-link'),
            actionsLink: document.getElementById('actions-link')
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('Initializing Weather Dashboard...');
        
        // Set up event listeners
        this.elements.searchBtn.addEventListener('click', () => this.searchWeather());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        this.elements.useLocationBtn.addEventListener('click', () => this.useGeolocation());
        
        // Set repository info
        this.setRepositoryInfo();
        
        // Try to get API key from environment or prompt
        this.getApiKey().then(() => {
            // Load initial weather
            this.fetchWeatherData(this.currentCity);
            this.fetchForecastData(this.currentCity);
            
            // Auto-update every 10 minutes
            setInterval(() => {
                this.fetchWeatherData(this.currentCity);
                this.fetchForecastData(this.currentCity);
            }, 600000); // 10 minutes
        });
    }
    
    async getApiKey() {
        // Try to get API key from localStorage first
        const savedKey = localStorage.getItem('weatherApiKey');
        
        if (savedKey) {
            this.apiKey = savedKey;
            return;
        }
        
        // If no saved key, prompt user
        const userKey = prompt(
            'Enter your OpenWeatherMap API key:\n\n' +
            '1. Go to https://openweathermap.org/\n' +
            '2. Sign up for free\n' +
            '3. Get your API key from dashboard\n' +
            '4. Enter it here\n\n' +
            'Or click Cancel to use demo data'
        );
        
        if (userKey && userKey.trim()) {
            this.apiKey = userKey.trim();
            localStorage.setItem('weatherApiKey', this.apiKey);
            console.log('API key saved to localStorage');
        } else {
            // Use demo mode
            console.log('Running in demo mode');
            this.apiKey = null;
        }
    }
    
    async fetchWeatherData(city) {
        try {
            this.showLoading(true);
            
            if (!this.apiKey) {
                // Use demo data if no API key
                this.useDemoData(city);
                return;
            }
            
            const response = await fetch(
                `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=${this.units}&appid=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.updateCurrentWeather(data);
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError(`Failed to get weather for ${city}. Using demo data.`);
            this.useDemoData(city);
        } finally {
            this.showLoading(false);
            this.updateLastUpdated();
        }
    }
    
    async fetchForecastData(city) {
        try {
            if (!this.apiKey) {
                // Use demo forecast if no API key
                this.useDemoForecast();
                return;
            }
            
            const response = await fetch(
                `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&units=${this.units}&appid=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`Forecast API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.updateForecast(data);
            
        } catch (error) {
            console.error('Error fetching forecast:', error);
            this.useDemoForecast();
        }
    }
    
    updateCurrentWeather(data) {
        // Update current weather display
        this.elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
        this.elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        this.elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        this.elements.humidity.textContent = `${data.main.humidity}%`;
        this.elements.windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
        this.elements.pressure.textContent = `${data.main.pressure} hPa`;
        
        // Weather description and icon
        const weather = data.weather[0];
        this.elements.weatherDescription.textContent = weather.description;
        this.elements.weatherIcon.className = `fas ${this.getWeatherIcon(weather.icon)}`;
        this.elements.weatherIcon.style.color = this.getIconColor(weather.icon);
        
        // Update background based on weather
        this.updateBackground(weather.main);
    }
    
    updateForecast(data) {
        const forecastContainer = this.elements.forecastContainer;
        forecastContainer.innerHTML = '';
        
        // Group forecasts by day
        const dailyForecasts = {};
        
        data.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!dailyForecasts[dayKey]) {
                dailyForecasts[dayKey] = {
                    date: date,
                    temps: [],
                    weather: []
                };
            }
            
            dailyForecasts[dayKey].temps.push(forecast.main.temp);
            dailyForecasts[dayKey].weather.push(forecast.weather[0]);
        });
        
        // Create forecast cards for next 5 days
        const days = Object.values(dailyForecasts).slice(0, 5);
        
        days.forEach(day => {
            const avgTemp = Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length);
            const mainWeather = this.getMostCommonWeather(day.weather);
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-day';
            forecastCard.innerHTML = `
                <div class="date">${day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <i class="fas ${this.getWeatherIcon(mainWeather.icon)}" style="color: ${this.getIconColor(mainWeather.icon)}; font-size: 1.5rem;"></i>
                <div class="temp">${avgTemp}°C</div>
                <div class="description">${mainWeather.description}</div>
            `;
            
            forecastContainer.appendChild(forecastCard);
        });
    }
    
    getMostCommonWeather(weatherArray) {
        // Find the most frequent weather condition
        const counts = {};
        weatherArray.forEach(w => {
            counts[w.main] = (counts[w.main] || 0) + 1;
        });
        
        const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        return weatherArray.find(w => w.main === mostCommon);
    }
    
    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fa-sun',           // clear sky day
            '01n': 'fa-moon',          // clear sky night
            '02d': 'fa-cloud-sun',     // few clouds day
            '02n': 'fa-cloud-moon',    // few clouds night
            '03d': 'fa-cloud',         // scattered clouds
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',         // broken clouds
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-rain',    // shower rain
            '09n': 'fa-cloud-rain',
            '10d': 'fa-cloud-sun-rain',// rain day
            '10n': 'fa-cloud-moon-rain',// rain night
            '11d': 'fa-bolt',          // thunderstorm
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',     // snow
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',          // mist
            '50n': 'fa-smog'
        };
        
        return iconMap[iconCode] || 'fa-question';
    }
    
    getIconColor(iconCode) {
        const colorMap = {
            '01d': '#f59e0b',  // sun - yellow
            '01n': '#64748b',   // moon - gray
            '02d': '#fbbf24',   // cloud sun - orange
            '02n': '#94a3b8',   // cloud moon - light gray
            '03d': '#94a3b8',   // cloud - gray
            '03n': '#64748b',   // cloud - dark gray
            '04d': '#64748b',   // broken clouds - dark gray
            '04n': '#475569',   // broken clouds night - darker gray
            '09d': '#3b82f6',   // rain - blue
            '09n': '#1d4ed8',   // rain night - dark blue
            '10d': '#60a5fa',   // sun rain - light blue
            '10n': '#2563eb',   // moon rain - blue
            '11d': '#8b5cf6',   // thunder - purple
            '11n': '#7c3aed',   // thunder night - dark purple
            '13d': '#93c5fd',   // snow - light blue
            '13n': '#60a5fa',   // snow night - blue
            '50d': '#cbd5e1',   // mist - light gray
            '50n': '#94a3b8'    // mist night - gray
        };
        
        return colorMap[iconCode] || '#4f46e5';
    }
    
    updateBackground(weatherMain) {
        const gradientMap = {
            'Clear': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'Clouds': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            'Rain': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            'Drizzle': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            'Thunderstorm': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            'Snow': 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)',
            'Mist': 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
            'Fog': 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
        };
        
        const gradient = gradientMap[weatherMain] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        document.body.style.background = gradient;
    }
    
    useDemoData(city) {
        // Realistic demo data based on city
        const demoData = {
            name: city,
            sys: { country: 'GB' },
            main: {
                temp: this.getCityTemperature(city),
                feels_like: this.getCityTemperature(city) - 2,
                humidity: Math.floor(Math.random() * 30) + 50,
                pressure: Math.floor(Math.random() * 50) + 1000
            },
            wind: {
                speed: (Math.random() * 8 + 2) / 3.6 // Convert to m/s
            },
            weather: [{
                description: this.getCityWeather(city),
                icon: this.getCityIcon(city),
                main: this.getCityMainWeather(city)
            }]
        };
        
        this.updateCurrentWeather(demoData);
    }
    
    useDemoForecast() {
        const forecastContainer = this.elements.forecastContainer;
        forecastContainer.innerHTML = '';
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const demoIcons = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-sun'];
        const demoColors = ['#f59e0b', '#fbbf24', '#94a3b8', '#3b82f6', '#f59e0b'];
        const demoDescriptions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Sunny'];
        
        days.forEach((day, index) => {
            const temp = 18 + Math.floor(Math.random() * 10);
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-day';
            forecastCard.innerHTML = `
                <div class="date">${day}</div>
                <i class="fas ${demoIcons[index]}" style="color: ${demoColors[index]}; font-size: 1.5rem;"></i>
                <div class="temp">${temp}°C</div>
                <div class="description">${demoDescriptions[index]}</div>
            `;
            
            forecastContainer.appendChild(forecastCard);
        });
    }
    
    getCityTemperature(city) {
        const cityTemps = {
            'London': 15,
            'Paris': 18,
            'New York': 20,
            'Tokyo': 22,
            'Sydney': 25,
            'Moscow': 10,
            'Dubai': 35,
            'Rio de Janeiro': 28
        };
        
        return cityTemps[city] || 20;
    }
    
    getCityWeather(city) {
        const cityWeather = {
            'London': 'Cloudy with a chance of rain',
            'Paris': 'Partly cloudy',
            'New York': 'Sunny',
            'Tokyo': 'Clear sky',
            'Sydney': 'Sunny',
            'Moscow': 'Cold and snowy',
            'Dubai': 'Hot and sunny',
            'Rio de Janeiro': 'Warm and humid'
        };
        
        return cityWeather[city] || 'Partly cloudy';
    }
    
    getCityIcon(city) {
        const cityIcons = {
            'London': '04d',
            'Paris': '02d',
            'New York': '01d',
            'Tokyo': '01d',
            'Sydney': '01d',
            'Moscow': '13d',
            'Dubai': '01d',
            'Rio de Janeiro': '01d'
        };
        
        return cityIcons[city] || '02d';
    }
    
    getCityMainWeather(city) {
        const cityMain = {
            'London': 'Clouds',
            'Paris': 'Clouds',
            'New York': 'Clear',
            'Tokyo': 'Clear',
            'Sydney': 'Clear',
            'Moscow': 'Snow',
            'Dubai': 'Clear',
            'Rio de Janeiro': 'Clear'
        };
        
        return cityMain[city] || 'Clouds';
    }
    
    searchWeather() {
        const city = this.elements.cityInput.value.trim();
        if (city) {
            this.currentCity = city;
            this.fetchWeatherData(city);
            this.fetchForecastData(city);
        }
    }
    
    useGeolocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser.');
            return;
        }
        
        this.showLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    if (this.apiKey) {
                        // Get city name from coordinates
                        const response = await fetch(
                            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${this.apiKey}`
                        );
                        
                        if (response.ok) {
                            const locationData = await response.json();
                            if (locationData.length > 0) {
                                this.currentCity = locationData[0].name;
                                this.elements.cityInput.value = this.currentCity;
                                this.fetchWeatherData(this.currentCity);
                                this.fetchForecastData(this.currentCity);
                                return;
                            }
                        }
                    }
                    
                    // Fallback: Use coordinates directly
                    this.currentCity = `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
                    this.elements.cityInput.value = this.currentCity;
                    
                    // Fetch weather by coordinates
                    const weatherResponse = await fetch(
                        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&units=${this.units}&appid=${this.apiKey}`
                    );
                    
                    if (weatherResponse.ok) {
                        const weatherData = await weatherResponse.json();
                        this.updateCurrentWeather(weatherData);
                    } else {
                        throw new Error('Could not fetch weather for location');
                    }
                    
                } catch (error) {
                    console.error('Geolocation error:', error);
                    this.showError('Could not get weather for your location. Using default city.');
                    this.fetchWeatherData('London');
                } finally {
                    this.showLoading(false);
                }
            },
            (error) => {
                this.showLoading(false);
                this.showError(`Unable to retrieve your location: ${error.message}. Using London.`);
                this.fetchWeatherData('London');
            }
        );
    }
    
    showLoading(show) {
        if (show) {
            this.elements.weatherDescription.textContent = 'Loading...';
            this.elements.weatherIcon.className = 'fas fa-spinner fa-spin';
        }
    }
    
    showError(message) {
        console.error(message);
        // Could add a toast notification here
        alert(message);
    }
    
    updateLastUpdated() {
        const now = new Date();
        this.elements.lastUpdated.textContent = now.toLocaleTimeString();
    }
    
    setRepositoryInfo() {
        // Get repository info from GitHub Pages URL
        const repoPath = window.location.pathname.split('/').filter(p => p);
        if (repoPath.length >= 2) {
            const repoName = `${repoPath[0]}/${repoPath[1]}`;
            this.elements.repoLink.href = `https://github.com/${repoName}`;
            this.elements.actionsLink.href = `https://github.com/${repoName}/actions`;
        }
        
        // Set build info (demo - in real CI/CD this would come from environment)
        this.elements.buildNumber.textContent = '#1';
        this.elements.commitHash.textContent = this.generateCommitHash();
        this.elements.deployTime.textContent = new Date().toLocaleString();
        this.elements.runnerInfo.textContent = 'GitHub Actions';
    }
    
    generateCommitHash() {
        return Array.from({length: 7}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting dashboard...');
    const dashboard = new WeatherDashboard();
});