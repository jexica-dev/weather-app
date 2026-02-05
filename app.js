const API_KEY = '312f4f9aed9218cba772b2f0f723a1b6';
const isConditionsPage = window.location.pathname.includes('conditions.html');
let currentUnit = 'F',
  weatherState = null;

window.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('weatherData'); // Reset on refresh
  resetDisplay();

  document.getElementById('search-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      getWeather();
    }
  });
});

async function getWeather() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return alert('Enter a Zipcode or City');

  const valueDisplay = document.getElementById('weather-value-display');
  if (valueDisplay) {
    valueDisplay.style.display = 'flex';
    valueDisplay.textContent = '...';
  }

  try {
    const param = /^\d{5}$/.test(query) ? `zip=${query},US` : `q=${query}`;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?${param}&appid=${API_KEY}&units=imperial`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Location not found');
    const weatherData = await weatherRes.json();

    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&limit=1&appid=${API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    const geo = geoData[0];

    weatherState = {
      city: geo?.name || weatherData.name,
      state: geo?.state || '',
      country: geo?.country || weatherData.sys.country,
      temp: Math.round(weatherData.main.temp),
      description: weatherData.weather[0].description,
      main: weatherData.weather[0].main,
    };

    localStorage.setItem('weatherData', JSON.stringify(weatherState));
    displayWeather(weatherState);
  } catch (error) {
    alert(error.message);
    resetDisplay();
  }
}

function displayWeather(data) {
  if (!data) return;

  document.querySelector('.temp-label-svg')?.classList.add('fade-out');

  const valueDisplay = document.getElementById('weather-value-display');
  if (valueDisplay) {
    valueDisplay.style.display = 'flex';
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

  const locationDisplay = document.getElementById('location-display');
  if (locationDisplay) {
    locationDisplay.textContent = [data.city, data.state, data.country]
      .filter(Boolean)
      .join(', ');
    locationDisplay.style.display = 'block';
  }

  const toggleBtn = document.getElementById('unit-toggle');
  if (toggleBtn) toggleBtn.style.display = isConditionsPage ? 'none' : 'block';

  toggleBtn.textContent = currentUnit === 'F' ? '°C' : '°F';
}

function toggleUnit() {
  currentUnit = currentUnit === 'F' ? 'C' : 'F';
  if (weatherState) displayWeather(weatherState);

  document.getElementById('unit-toggle').textContent =
    currentUnit === 'F' ? '°C' : '°F';
}

function resetDisplay() {
  document.querySelector('.temp-label-svg')?.classList.remove('fade-out');
  const valDisp = document.getElementById('weather-value-display');
  if (valDisp) valDisp.textContent = '';

  const locDisp = document.getElementById('location-display');
  if (locDisp) {
    locDisp.textContent = '';
    locDisp.style.display = 'none';
  }

  const btn = document.getElementById('unit-toggle');
  if (btn) btn.style.display = 'none';
}

function getConditionsDescription(main, description) {
  const map = {
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
    map[main] ||
    description.charAt(0).toUpperCase() + description.slice(1) + '.'
  );
}
