// Weather Dashboard Application
class WeatherDashboard {
    constructor() {
        // Initialize with default city
        this.city = 'London';
        this.weatherData = null;
        this.lastUpdated = null;
        
        // DOM Elements
        this.elements = {
            cityName: document.getElementById('city-name'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feels-like'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('wind-speed'),
            pressure: document.getElementById('pressure'),
            weatherDescription: document.getElementById('weather-description'),
            weatherIcon: document.getElementById('weather-icon'),
            lastUpdated: document.getElementById('last-updated'),
            cityInput: document.getElementById('city-input'),
            searchBtn: document.getElementById('search-btn'),
            useLocationBtn: document.getElementById('use-location-btn'),
            commitHash: document.getElementById('commit-hash'),
            deployTime: document.getElementById('deploy-time'),
            buildNumber: document.getElementById('build-number'),
            runnerInfo: document.getElementById('runner-info'),
            repoLink: document.getElementById('repo-link'),
            actionsLink: document.getElementById('actions-link'),
            ciSteps: {
                test: document.getElementById('step-test'),
                build: document.getElementById('step-build'),
                deploy: document.getElementById('step-deploy')
            }
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.elements.searchBtn.addEventListener('click', () => this.searchWeather());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        
        this.elements.useLocationBtn.addEventListener('click', () => this.useGeolocation());
        
        // Set repository info
        this.setRepositoryInfo();
        
        // Simulate CI/CD pipeline status
        this.simulateCIPipeline();
        
        // Load initial weather data
        this.fetchWeatherData();
        
        // Update every 5 minutes
        setInterval(() => this.fetchWeatherData(), 300000);
    }
    
    async fetchWeatherData() {
        try {
            // For demo purposes, we'll use a mock API
            // In a real app, you'd use OpenWeatherMap API or similar
            await this.simulateAPIRequest();
            
            // Update last updated time
            this.lastUpdated = new Date();
            this.elements.lastUpdated.textContent = this.formatTime(this.lastUpdated);
            
        } catch (error) {
            console.error('Error fetching weather data:', error);
            this.showError('Failed to fetch weather data. Using demo data.');
            this.useDemoData();
        }
    }
    
    simulateAPIRequest() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate realistic weather data
                const weatherConditions = [
                    { type: 'sunny', temp: 22, icon: 'fa-sun', desc: 'Sunny' },
                    { type: 'cloudy', temp: 18, icon: 'fa-cloud', desc: 'Cloudy' },
                    { type: 'rainy', temp: 15, icon: 'fa-cloud-rain', desc: 'Rainy' },
                    { type: 'stormy', temp: 17, icon: 'fa-bolt', desc: 'Stormy' },
                    { type: 'snowy', temp: -2, icon: 'fa-snowflake', desc: 'Snowy' }
                ];
                
                const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
                
                this.weatherData = {
                    city: this.city,
                    temperature: randomCondition.temp,
                    feels_like: randomCondition.temp - 2,
                    humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
                    wind_speed: Math.floor(Math.random() * 30) + 5, // 5-35 km/h
                    pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
                    description: randomCondition.desc,
                    icon: randomCondition.icon
                };
                
                this.updateUI();
                resolve();
            }, 800); // Simulate network delay
        });
    }
    
    useDemoData() {
        this.weatherData = {
            city: this.city,
            temperature: 20,
            feels_like: 18,
            humidity: 65,
            wind_speed: 15,
            pressure: 1013,
            description: 'Partly Cloudy',
            icon: 'fa-cloud-sun'
        };
        this.updateUI();
    }
    
    updateUI() {
        if (!this.weatherData) return;
        
        const w = this.weatherData;
        
        this.elements.cityName.textContent = w.city;
        this.elements.temperature.textContent = `${w.temperature}°C`;
        this.elements.feelsLike.textContent = `${w.feels_like}°C`;
        this.elements.humidity.textContent = `${w.humidity}%`;
        this.elements.windSpeed.textContent = `${w.wind_speed} km/h`;
        this.elements.pressure.textContent = `${w.pressure} hPa`;
        this.elements.weatherDescription.textContent = w.description;
        
        // Update weather icon
        this.elements.weatherIcon.className = `fas ${w.icon}`;
        this.elements.weatherIcon.style.color = this.getIconColor(w.icon);
    }
    
    getIconColor(icon) {
        const colors = {
            'fa-sun': '#f59e0b',
            'fa-cloud': '#64748b',
            'fa-cloud-sun': '#fbbf24',
            'fa-cloud-rain': '#3b82f6',
            'fa-bolt': '#8b5cf6',
            'fa-snowflake': '#93c5fd'
        };
        return colors[icon] || '#4f46e5';
    }
    
    searchWeather() {
        const city = this.elements.cityInput.value.trim();
        if (city) {
            this.city = city;
            this.fetchWeatherData();
        }
    }
    
    useGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // In a real app, you'd reverse geocode to get city name
                    this.city = 'Your Location';
                    this.fetchWeatherData();
                },
                (error) => {
                    this.showError('Unable to retrieve your location. Using London.');
                    this.city = 'London';
                    this.fetchWeatherData();
                }
            );
        } else {
            this.showError('Geolocation is not supported by your browser.');
        }
    }
    
    setRepositoryInfo() {
        // Get current repository info from GitHub API
        const repoUrl = window.location.origin + window.location.pathname;
        const repoName = repoUrl.split('/').slice(-2).join('/').replace('.github.io', '');
        
        // Set links
        this.elements.repoLink.href = `https://github.com/${repoName}`;
        this.elements.actionsLink.href = `https://github.com/${repoName}/actions`;
        
        // Set build info (simulated)
        this.elements.buildNumber.textContent = `#${Math.floor(Math.random() * 100) + 1}`;
        this.elements.commitHash.textContent = this.generateCommitHash();
        this.elements.deployTime.textContent = new Date().toLocaleString();
        this.elements.runnerInfo.textContent = 'GitHub Actions Ubuntu Runner';
    }
    
    generateCommitHash() {
        return Array.from({length: 7}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
    
    simulateCIPipeline() {
        // Simulate CI/CD pipeline steps with delays
        setTimeout(() => {
            this.elements.ciSteps.test.classList.add('active');
        }, 500);
        
        setTimeout(() => {
            this.elements.ciSteps.build.classList.add('active');
        }, 1500);
        
        setTimeout(() => {
            this.elements.ciSteps.deploy.classList.add('active');
        }, 2500);
    }
    
    formatTime(date) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    showError(message) {
        console.warn(message);
        // You could add a toast notification here
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});