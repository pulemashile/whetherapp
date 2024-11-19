import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationArrow, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import './App.css';

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
  const [geolocationWeatherData, setGeolocationWeatherData] = useState(null); // Store weather data for geolocation

  const apiKey = 'fee4a8521008cfaa15374d867377664e';

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
        const cachedDailyForecastData = localStorage.getItem('dailyForecast');
        if (cachedWeatherData && cachedForecastData && cachedDailyForecastData) {
          setWeatherData(JSON.parse(cachedWeatherData));
          setHourlyForecast(JSON.parse(cachedForecastData));
          setDailyForecast(JSON.parse(cachedDailyForecastData));
          setLoading(false);
          return;
        } else {
          setError('No cached data available. Please try again when online.');
          setLoading(false);
          return;
        }
      }

      // Fetch the weather data and forecast
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&appid=${apiKey}&units=${units}`
      );
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?id=${data.id}&appid=${apiKey}&units=${units}`
      );
      if (!forecastResponse.ok) throw new Error('Network response was not ok');

      const forecastData = await forecastResponse.json();

      // Get hourly forecast (first 5 intervals)
      const hourlyData = forecastData.list.slice(1, 6);
      setHourlyForecast(hourlyData);

      // Get daily forecast (one data point per day)
      const dailyData = forecastData.list.filter((item, index) => index % 8 === 0);
      setDailyForecast(dailyData);

      // Set weather alert based on current weather condition
      const alertMessage = getWeatherAlert(data.weather[0].main);
      setWeatherAlert(alertMessage);

      // Store in localStorage
      localStorage.setItem('weatherData', JSON.stringify(data));
      localStorage.setItem('hourlyForecast', JSON.stringify(hourlyData));
      localStorage.setItem('dailyForecast', JSON.stringify(dailyData));

      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Error fetching weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Geolocation function to fetch weather based on user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Fetching weather for geolocation:', latitude, longitude);

          // Fetch current weather based on geolocation
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`)
            .then((response) => response.json())
            .then((data) => {
              setGeolocationWeatherData(data); // Store geolocation weather data
              setWeatherData(data); // Set the weather data based on geolocation

              // Fetch forecast data after getting the weather
              return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`);
            })
            .then((forecastResponse) => forecastResponse.json())
            .then((forecastData) => {
              // Get hourly forecast (first 5 intervals)
              const hourlyData = forecastData.list.slice(1, 6);
              setHourlyForecast(hourlyData);

              // Get daily forecast (one data point per day)
              const dailyData = forecastData.list.filter((item, index) => index % 8 === 0);
              setDailyForecast(dailyData);
            })
            .catch((error) => {
              console.error('Error fetching geolocation weather data:', error);
              setError('Error fetching weather data. Please try again later.');
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
      default:
        return 'Check the weather forecast for more information.';
    }
  };

  const toggleUnits = () => setUnits(units === 'metric' ? 'imperial' : 'metric');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if (searchInput) handleSearch(); // Trigger search when input changes
  }, [units]);

  return (
    <div className='parent-element'>
      <div className={`container ${theme}`}>
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
                <img
                  src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                  alt={weatherData.weather[0].description}
                />
              </span>
              <span className="temperature">
                {`${weatherData.main.temp} ${units === 'metric' ? '°C' : '°F'}`}
              </span>
            </p>
            <p className="weather-description">{weatherData.weather[0].description}</p>
          </div>
        ) : (
          <div className="no-data-message">No weather data found for the given location.</div>
        )}

        {weatherAlert && (
          <div className="weather-alert">
            <strong>Alert:</strong> {weatherAlert}
          </div>
        )}

        {/* Hourly Forecast */}
        <div className="hourly-forecast">
          <h2>Hourly Forecast</h2>
          <div className="hourly-forecast-container">
            {hourlyForecast.map((forecast, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(forecast.dt_txt).toLocaleTimeString()}</p>
                <img
                  src={`http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                  alt={forecast.weather[0].description}
                />
                <p>{`${forecast.main.temp} ${units === 'metric' ? '°C' : '°F'}`}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Forecast */}
        <div className="daily-forecast">
          <h2>Daily Forecast</h2>
          <div className="daily-forecast-container">
            {dailyForecast.map((forecast, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(forecast.dt_txt).toLocaleDateString()}</p>
                <img
                  src={`http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                  alt={forecast.weather[0].description}
                />
                <p>{`${forecast.main.temp} ${units === 'metric' ? '°C' : '°F'}`}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
