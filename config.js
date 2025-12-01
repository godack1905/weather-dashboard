// Configuration for Weather Dashboard
const config = {
    // Get API key from environment, localStorage, or prompt
    getApiKey: function() {
        return localStorage.getItem('weatherApiKey') || 
               process.env.OPENWEATHER_API_KEY || 
               '';
    },
    
    // Default settings
    defaults: {
        city: 'London',
        units: 'metric',
        updateInterval: 10 // minutes
    },
    
    // API endpoints
    endpoints: {
        current: 'https://api.openweathermap.org/data/2.5/weather',
        forecast: 'https://api.openweathermap.org/data/2.5/forecast',
        geocoding: 'https://api.openweathermap.org/geo/1.0/direct',
        reverseGeocoding: 'https://api.openweathermap.org/geo/1.0/reverse'
    }
};

export default config;