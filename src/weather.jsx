import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationArrow, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import "./App.css";
import video from '../src/assets/173530-849610807.mp4';

const WeatherApp = () => {
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [units, setUnits] = useState('metric');
  const [theme, setTheme] = useState('light');
  const [weatherAlert, setWeatherAlert] = useState('');

  const apiKey = 'c172f3bb497fb9ea39f1d62565ac9545';

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

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`)
            .then((response) => response.json())
            .then((data) => {
              setWeatherData(data);
              setHourlyForecast([]);
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

  const getWeatherAlert = (condition) => {
    switch (condition) {
      case 'Rain':
        return 'It\'s going to rain today. Please take precautions.';
      case 'Clouds':
        return 'It\'s going to be cloudy today.';
      case 'Clear':
        return 'It\'s going to be a clear day today.';
      case 'Snow':
        return 'It\'s going to snow today. Please take precautions.';
      case 'Thunderstorm':
        return 'There\'s a thunderstorm warning today. Please take precautions.';
      case 'Drizzle':
        return 'It\'s going to drizzle today.';
      case 'Mist':
        return 'It\'s going to be misty today.';
      case 'Haze':
        return 'It\'s going to be hazy today.';
      case 'Fog':
        return 'It\'s going to be foggy today.';
      default:
        return 'Check the weather forecast for more information.';
    }
  };

  const toggleUnits = () => setUnits(units === 'metric' ? 'imperial' : 'metric');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if (location) handleSearch();
  }, [location, units]);

  return (
    <div className='parent-element'>
      <div className={`container ${theme}`} >
        <h1>Weather App</h1>
        <p>Click here to go to the POPI Act page:</p>
        <Link to="/popi-act">Terms and Conditions</Link>
            
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
            <h2>{`${weatherData.name}, ${weatherData.sys.country}`}</h2>
            <p>
              <span className="weather-icon">
                <img src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`} alt={weatherData.weather[0].description} />
              </span>
              <span className="temperature">{`${weatherData.main.temp} ${units === 'metric' ? '°C' : '°F'}`}</span>
            </p>
            <p className="weather-description">{weatherData.weather[0].description}</p>
            <div className="weather-details">
              <div><p>Humidity</p><p>{`${weatherData.main.humidity}%`}</p></div>
              <div><p>Wind Speed</p><p>{`${weatherData.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}`}</p></div>
            </div>
          </div>
        ) : (
          <div className="no-data-message">No weather data found for the given location.</div>
        )}

        {weatherAlert && (
          <div className="weather-alert">
            <strong>Alert:</strong> {weatherAlert}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default WeatherApp;
