import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationArrow, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import "./App.css";
import 

const WeatherApp = () => {
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [units, setUnits] = useState('metric');
  const [theme, setTheme] = useState('light');
  const [weatherAlert, setWeatherAlert] = useState('');

  const apiKey = 'fee4a8521008cfaa15374d867377664e'; // Your provided API key

  // Handle search functionality
  const handleSearch = async () => {
    if (searchInput.trim() === '') {
      setError('Please enter a location');
      return;
    }
    try {
      setLoading(true);
      setSearchInput('');
      setError('');

      const isOnline = navigator.onLine;
      if (!isOnline) {
        const cachedWeatherData = localStorage.getItem('weatherData');
        const cachedForecastData = localStorage.getItem('hourlyForecast');
        if (cachedWeatherData && cachedForecastData) {
          setWeatherData(JSON.parse(cachedWeatherData));
          setHourlyForecast(JSON.parse(cachedForecastData));
          setLoading(false);
          return;
        } else {
          setError('No cached data available. Please try again when online.');
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&appid=${apiKey}&units=${units}`);
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${data.id}&appid=${apiKey}&units=${units}`);
      if (!forecastResponse.ok) throw new Error('Network response was not ok');

      const forecastData = await forecastResponse.json();

      const alertMessage = getWeatherAlert(data.weather[0].main);
      setWeatherAlert(alertMessage);

      localStorage.setItem('weatherData', JSON.stringify(data));
      localStorage.setItem('hourlyForecast', JSON.stringify(forecastData.list.slice(1, 6)));

      setWeatherData(data);
      setHourlyForecast(forecastData.list.slice(1, 6));
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Error fetching weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  // Handle geolocation functionality
  const getUserLocation = () => { 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`)
            .then((response) => response.json())
            .then((data) => {
              setWeatherData(data);
              setHourlyForecast(data.list.slice(0, 5));
              setDailyForecast(data.list.filter((item, index) => index % 8 === 0).slice(0, 5));
            })
            .catch((error) => {
              console.error('Error fetching user location:', error);
              setError('Error fetching user location. Please try again later.');
            });
        },
        (error) => {
          console.error('Error getting user location:', error);
          setError('Error getting user location. Please check your browser settings.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // Toggle temperature units (metric or imperial)
  const toggleUnits = () => setUnits(units === 'metric' ? 'imperial' : 'metric');

  // Toggle theme (light or dark)
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`parent-element ${theme}`}>
      <div className={`container ${theme}`}>
        <h1>Weather App</h1>
        
        <div className="search-container">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter a location"
          />
          <button onClick={handleSearch}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <button onClick={getUserLocation}>
            <FontAwesomeIcon icon={faLocationArrow} />
          </button>
          <button onClick={toggleUnits}>
            {units === 'metric' ? '°C' : '°F'}
          </button>
          <button onClick={toggleTheme}>
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : weatherData ? (
          <div className="weather-info">
            <h2>{`${weatherData.city.name}, ${weatherData.city.country}`}</h2>
            <p>
              <span className="weather-icon">
                <img src={`http://openweathermap.org/img/w/${weatherData.list[0].weather[0].icon}.png`} alt={weatherData.list[0].weather[0].description} />
              </span>
              <span className="temperature">{`${weatherData.list[0].main.temp} ${units === 'metric' ? '°C' : '°F'}`}</span>
            </p>
            <p className="weather-description">{weatherData.list[0].weather[0].description}</p>
            <div className="weather-details">
              <div><p>Humidity</p><p>{`${weatherData.list[0].main.humidity}%`}</p></div>
              <div><p>Wind Speed</p><p>{`${weatherData.list[0].wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}`}</p></div>
            </div>
          </div>
        ) : (
          <div className="no-data-message">No weather data found for the given location.</div>
        )}

        {/* Hourly Forecast */}
        <div className="hourly-forecast">
          <h2>Hourly Forecast</h2>
          <div className="hourly-forecast-container">
            {hourlyForecast.map((hour, index) => (
              <div key={index} className="hourly-forecast-item">
                <p className="hour">{new Date(hour.dt * 1000).getHours()}:00</p>
                <div className="weather-icon">
                  <img src={`http://openweathermap.org/img/w/${hour.weather[0].icon}.png`} alt={hour.weather[0].description} />
                </div>
                <p className="temperature">{`${hour.main.temp} ${units === 'metric' ? '°C' : '°F'}`}</p>
                <p className="description">{hour.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Forecast */}
        <div className="daily-forecast">
          <h2>Daily Forecast</h2>
          <div className="daily-forecast-container">
            {dailyForecast.map((day, index) => (
              <div key={index} className="daily-forecast-item">
                <p className="date">{new Date(day.dt * 1000).toLocaleDateString()}</p>
                <div className="weather-icon">
                  <img src={`http://openweathermap.org/img/w/${day.weather[0].icon}.png`} alt={day.weather[0].description} />
                </div>
                <p className="temperature">{`${day.main.temp} ${units === 'metric' ? '°C' : '°F'}`}</p>
                <p className="description">{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
