// Simple test file for our weather dashboard
test('Temperature conversion function', () => {
    // Example test - in real app, you'd test your actual functions
    const celsiusToFahrenheit = (c) => (c * 9/5) + 32;
    
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(-40)).toBe(-40);
});

test('Weather icon selection', () => {
    const getIcon = (condition) => {
        const icons = {
            sunny: 'fa-sun',
            cloudy: 'fa-cloud',
            rainy: 'fa-cloud-rain'
        };
        return icons[condition] || 'fa-question';
    };
    
    expect(getIcon('sunny')).toBe('fa-sun');
    expect(getIcon('cloudy')).toBe('fa-cloud');
    expect(getIcon('unknown')).toBe('fa-question');
});