// build.js - Build script for GitHub Actions
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Read .env file if exists
let apiKey = '';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/OPENWEATHER_API_KEY=(.+)/);
    if (match) {
        apiKey = match[1].trim();
        console.log('✅ Found API key in .env file');
    }
}

// If no .env, try environment variable
if (!apiKey && process.env.OPENWEATHER_API_KEY) {
    apiKey = process.env.OPENWEATHER_API_KEY;
    console.log('✅ Using API key from environment variable');
}

if (!apiKey) {
    console.log('⚠️ No API key found. Will use demo mode.');
    apiKey = '';
}

// Create dist folder
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy files to dist
const filesToCopy = ['index.html', 'style.css', 'app.js'];
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, `dist/${file}`);
        console.log(`📄 Copied ${file}`);
    }
});

// Create config.js with actual API key
const configContent = `// config.js - Auto-generated configuration
window.WeatherConfig = {
    apiKey: '${apiKey}',
    defaultCity: 'London',
    units: 'metric',
    updateInterval: 10,
    isProduction: window.location.hostname.includes('github.io'),
    isLocal: window.location.hostname.includes('localhost') || 
             window.location.protocol === 'file:'
};`;

fs.writeFileSync('dist/config.js', configContent);
console.log('📝 Created config.js with API key');

// Create a simple test config for local development
const localConfig = `// config.js - For local development
// Add your API key to .env file or edit this directly
window.WeatherConfig = {
    apiKey: '${apiKey || 'YOUR_API_KEY_HERE'}',
    defaultCity: 'London',
    units: 'metric',
    updateInterval: 10,
    isProduction: false,
    isLocal: true
};`;

fs.writeFileSync('config.js', localConfig);
console.log('📝 Updated local config.js');

console.log('✅ Build completed successfully!');