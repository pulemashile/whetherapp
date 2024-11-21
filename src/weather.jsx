import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationArrow, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import video from '../src/assets/173530-849610807.mp4';
import umbrellas from '../src/assets/umbrellas.jpg';
import cloud from '../src/assets/cloud.jpg';
import example from '../src/assets/example.png';
import wheather from '../src/assets/wheather.png';
import woman from '../src/assets/woman.png';

const WeatherApp = () => {
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [units, setUnits] = useState('metric');
  const [theme, setTheme] = useState('light');
  const [geolocationError, setGeolocationError] = useState('');

  const apiKey = 'fee4a8521008cfaa15374d867377664e';

  const fetchWeatherData = async (lat, lon) => {
    setLoading(true);
    setError('');
    
    try {
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`);
      
      if (!weatherResponse.ok) throw new Error('Failed to fetch weather data');
      
      const weatherData = await weatherResponse.json();
      
      const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`);
      
      if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data');
      
      const forecastData = await forecastResponse.json();
      
      setWeatherData(weatherData);
      setHourlyForecast(forecastData.list.slice(1, 6));  // Next 5 hourly forecast
      setDailyForecast(forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5)); // Daily forecast (every 8th entry)
      
      const alertMessage = getWeatherAlert(weatherData.weather[0].main);

      if (alertMessage) {
        toast.info(alertMessage); // Trigger the toast
      }

      localStorage.setItem('weatherData', JSON.stringify(weatherData));
      localStorage.setItem('hourlyForecast', JSON.stringify(forecastData.list.slice(1, 6)));
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Error fetching weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchInput.trim() === '') {
      setError('Please enter a location');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&appid=${apiKey}&units=${units}`);
      
      if (!response.ok) throw new Error('City not found. Please try another location.');
      
      const data = await response.json();
      fetchWeatherData(data.coord.lat, data.coord.lon);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData(latitude, longitude);
            },
            (error) => {
                console.error('Error getting geolocation:', error);
                setGeolocationError('Location access denied or not available. Please check your browser settings.');
            }
        );
    } else {
        setGeolocationError('Geolocation is not supported by this browser.');
    }
};

  const toggleUnits = () => setUnits(units === 'metric' ? 'imperial' : 'metric');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const getWeatherAlert = (condition) => {
    switch (condition) {
      case 'Rain':
        return "It's going to rain today. Please take precautions.";
      case 'Clear':
        return "It's going to be a clear day today.";
      case 'Clouds':
        return "It’s going to be cloudy today.";
      case 'Snow':
        return "It's going to snow today. Please take precautions.";
      case 'Thunderstorm':
        return "There's a thunderstorm warning today. Please take precautions.";
      default:
        return "Check the weather forecast for more information.";
    }
  };

  return (
    <div className={`parent-element ${theme}`}>
      <Link to="/popi-act" className="link" style={{ 
        textDecoration: 'none', 
        color: '#333', 
        fontWeight: 'bold', 
        cursor: 'pointer' ,
        position: 'absolute',
        bottom: '20px',
        right: '2px',
        fontSize: '12px'
      }}>
        Terms and Conditions
      </Link>
      <div className={`container ${theme}`}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', margin: '20px 0', color: 'white', padding: '10px 0' }}>Weather App</h1>

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
        {geolocationError && <div className="error-message">{geolocationError}</div>}

        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : weatherData ? (
          <div className="weather-info">
            <h2>{`${weatherData.name}, ${weatherData.sys.country}`}</h2>
            <p>
              <span className="weather-icon">
                <img src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`} alt={weatherData.weather[0].description} />
              </span>
              <span className="temperature" style={{ fontSize: '24px', color: '#333', fontWeight: 'bold', marginRight: '10px' }}>
               {`${weatherData.main.temp} ${units === 'metric' ? '°C' : '°F'}`}
             </span>
            </p>
            <p className="weather-description" style={{ fontSize: '18px', color: '#666', fontStyle: 'italic', marginBottom: '20px' }}>
              {weatherData.weather[0].description}
            </p>
          </div>
        ) : (
         <div className="no-data-message" style={{ 
           fontSize: '24px', 
           fontWeight: '500', 
           color: '#666', 
           textTransform: 'capitalize', 
           letterSpacing: '0.5px', 
           padding: '20px', 
           textAlign: 'center' 
         }}>
           Enter the city you want to search
         </div>
        )}

        <div className="hourly-forecast">
          <h2>Hourly Forecast</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {hourlyForecast.map((hour, index) => (
              <div key={index} style={{ flexBasis: '20%', margin: '10px', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{new Date(hour.dt * 1000).getHours()}:00</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img src={`http://openweathermap.org/img/w/${hour.weather[0].icon}.png`} alt={hour.weather[0].description} style={{ width: '50px', height: '50px' }} />
                </div>
                <p style={{ fontSize: '16px', color: '#666' }}>{`${hour.main.temp} ${units === 'metric' ? '°C' : '°F'}`}</p>
                <p style={{ fontSize: '14px', color: '#999' }}>{hour.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>

        {weatherData && (
          <div className="daily-forecast">
            <h2>Daily Forecast</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {dailyForecast.map((day, index) => (
                <div key={index} style={{ flexBasis: '20%', margin: '10px', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                  <p className="day">{new Date(day.dt * 1000).toDateString()}</p>
                  <div className="weather-icon">
                    <img src={`http://openweathermap.org/img/w/${day.weather[0].icon}.png`} alt={day.weather[0].description} />
                  </div>
                  <p className="temperature">{`${day.main.temp} ${units === 'metric' ? '°C' : '°F'}`}</p>
                  <p className="description">{day.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <img src={woman} alt="Woman" className="responsive-woman-image" />
        <img 
  src={wheather} 
  alt="Weather Icon" 
  className="responsive-image" 
  style={{
    position: 'fixed', 
    bottom: '0', 
    left: '50%', 
    transform: 'translateX(-50%)',
    zIndex: '-1',  // Ensure it stays behind content
    filter: 'hue-rotate(180deg) saturate(0.5)'  // Optional styling for the image
  }} 
/>


      </div>

      <ToastContainer />
    </div>
  );
};

export default WeatherApp;
