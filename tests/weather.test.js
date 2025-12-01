// Simple test file for weather dashboard
console.log("Running weather dashboard tests...");

// Test 1: Basic arithmetic
function celsiusToFahrenheit(c) {
  return (c * 9/5) + 32;
}

// Test 2: Weather icon selection
function getWeatherIcon(condition) {
  const icons = {
    sunny: 'fa-sun',
    cloudy: 'fa-cloud',
    rainy: 'fa-cloud-rain',
    snowy: 'fa-snowflake'
  };
  return icons[condition] || 'fa-question';
}

// Run tests
let testsPassed = 0;
let testsFailed = 0;

// Test celsiusToFahrenheit
try {
  if (celsiusToFahrenheit(0) === 32) {
    console.log("✅ Test 1 passed: 0°C = 32°F");
    testsPassed++;
  } else {
    console.log("❌ Test 1 failed");
    testsFailed++;
  }
  
  if (celsiusToFahrenheit(100) === 212) {
    console.log("✅ Test 2 passed: 100°C = 212°F");
    testsPassed++;
  } else {
    console.log("❌ Test 2 failed");
    testsFailed++;
  }
} catch (error) {
  console.log("❌ Test error:", error.message);
  testsFailed++;
}

// Test getWeatherIcon
try {
  if (getWeatherIcon('sunny') === 'fa-sun') {
    console.log("✅ Test 3 passed: sunny icon correct");
    testsPassed++;
  } else {
    console.log("❌ Test 3 failed");
    testsFailed++;
  }
  
  if (getWeatherIcon('unknown') === 'fa-question') {
    console.log("✅ Test 4 passed: default icon correct");
    testsPassed++;
  } else {
    console.log("❌ Test 4 failed");
    testsFailed++;
  }
} catch (error) {
  console.log("❌ Test error:", error.message);
  testsFailed++;
}

// Summary
console.log("\n=== Test Summary ===");
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log("===================");

// Exit with appropriate code
if (testsFailed === 0) {
  console.log("🎉 All tests passed!");
  process.exit(0);
} else {
  console.log("❌ Some tests failed");
  process.exit(1);
}