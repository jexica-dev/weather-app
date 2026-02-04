const API_KEY = '312f4f9aed9218cba772b2f0f723a1b6';

const isConditionsPage = window.location.pathname.includes('conditions.html');
let currentUnit = 'F';
let weatherState = null;

window.addEventListener('DOMContentLoaded', () => {
  // Clear data on refresh
  localStorage.removeItem('weatherData');
  resetDisplay();

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        getWeather();
      }
    });
  }
});

async function getWeather() {
  const zipcode = document.getElementById('search-input').value.trim();

  if (!zipcode || zipcode.length !== 5 || isNaN(zipcode)) {
    alert('Please enter a valid 5-digit US zipcode');
    return;
  }

  const valueDisplay = document.getElementById('weather-value-display');
  if (valueDisplay) valueDisplay.textContent = '...';

  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},US&appid=${API_KEY}&units=imperial`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Zipcode not found');
    const data = await response.json();

    weatherState = {
      city: data.name,
      state: 'CA',
      zipcode: zipcode,
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      main: data.weather[0].main,
    };

    // Save briefly so switching to conditions.html works
    localStorage.setItem('weatherData', JSON.stringify(weatherState));
    displayWeather(weatherState);
  } catch (error) {
    alert(error.message);
    resetDisplay();
  }
}

function displayWeather(data) {
  if (!data) return;

  // Fade the curve
  const labelSvg = document.querySelector('.temp-label-svg');
  if (labelSvg) labelSvg.classList.add('fade-out');

  // Show Temperature or Conditions
  const valueDisplay = document.getElementById('weather-value-display');
  if (valueDisplay) {
    if (isConditionsPage) {
      valueDisplay.textContent = getConditionsDescription(
        data.main,
        data.description,
      );
      valueDisplay.className = 'weather-value conditions-text';
    } else {
      const temp =
        currentUnit === 'F'
          ? data.temp
          : Math.round(((data.temp - 32) * 5) / 9);
      valueDisplay.textContent = `${temp}°${currentUnit}`;
      valueDisplay.className = 'weather-value';
    }
  }

  // Show Location
  const locationDisplay = document.getElementById('location-display');
  if (locationDisplay) {
    locationDisplay.textContent = `${data.city}, ${data.state}, USA`;
    locationDisplay.style.display = 'block';
  }

  // Show Toggle Button (Temp page only)
  const toggleBtn = document.getElementById('unit-toggle');
  if (toggleBtn) {
    toggleBtn.style.display = isConditionsPage ? 'none' : 'block';
  }
}

function toggleUnit() {
  currentUnit = currentUnit === 'F' ? 'C' : 'F';
  if (weatherState) displayWeather(weatherState);
}

function resetDisplay() {
  const labelSvg = document.querySelector('.temp-label-svg');
  if (labelSvg) labelSvg.classList.remove('fade-out');

  const valueDisplay = document.getElementById('weather-value-display');
  if (valueDisplay) valueDisplay.textContent = '';

  const locationDisplay = document.getElementById('location-display');
  if (locationDisplay) locationDisplay.style.display = 'none';

  const toggleBtn = document.getElementById('unit-toggle');
  if (toggleBtn) toggleBtn.style.display = 'none';
}

function getConditionsDescription(main, description) {
  const conditionsMap = {
    Clear: 'Sunny with clear skies.',
    Clouds: 'Mostly cloudy skies.',
    Rain: 'Rainy conditions.',
    Drizzle: 'Light drizzle.',
    Thunderstorm: 'Thunderstorms expected.',
    Snow: 'Snowy conditions.',
    Mist: 'Misty and hazy.',
    Fog: 'Heavy fog.',
  };
  return (
    conditionsMap[main] ||
    description.charAt(0).toUpperCase() + description.slice(1) + '.'
  );
}
