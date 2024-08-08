import React, { useState } from 'react';

const App = () => {
  const [location, setLocation] = useState('New York, NY');
  const [humidity, setHumidity] = useState(60);
  const [windSpeed, setWindSpeed] = useState(10);
  const [temperature,setTemparature]=useState(36);

  const[list,setList]=useState([])
  const apiKey = '910948c2645b69157020047431ce98aa';

  const handleSearch = async () => {
    try {
      const w_response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
      const w_data = await w_response.json();

      console.log('city', w_data.name, 'id', w_data.id);
      
      const fc_response = await fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${w_data.id}&appid=${apiKey}&units=metric`);
      const fc_data = await fc_response.json();

      setHumidity(w_data.main.humidity);
      setWindSpeed(w_data.wind.speed);

      setList(fc_data.list)

      //console.log('forecast',fc_data.list);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      alert('Error fetching weather data. Please try again later.');
    }
  };
  
  // `http://api.openweathermap.org/data/2.5/forecast?id=524901&appid={API key}

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
            .then((response) => response.json())
            .then((data) => {
              const city = data.name;
              const country = data.sys.country;
              setLocation(`${city}, ${country}`);
              setHumidity(data.main.humidity);
              setWindSpeed(data.wind.speed);
              setTemparature(data.main.temp)
              
            })
            .catch((error) => {
              console.error('Error fetching user location:', error);
              alert('Error fetching user location. Please try again later.');
            });
        },
        (error) => {
          console.error('Error getting user location:', error);
          alert('Error getting user location. Please check your browser settings.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  console.log('...',list);
  

  return (
    <div className="container">
      <h1>Weather App</h1>
      <div className="search-container">
        <input
          type="text"
          id="search-input"
          placeholder="Enter a location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button id="search-button" onClick={handleSearch}>
          Search
        </button>
        <button id="locate-button" onClick={getUserLocation}>
          Use My Location
        </button>
      </div>
      <div className="weather-info">
        <div>
          <h2 id="location">{location}</h2>
          <p>Location</p>
        </div>
        <div>
          <h2 id="humidity">{humidity}%</h2>
          <p>Humidity</p>
        </div>
        <div>
          <h2 id="wind-speed">{windSpeed} m/s</h2>
          <p>Wind Speed</p>
           </div>
           <div>
           <h2 id="temperature">{temperature} °C</h2>
          <p>temperature</p>
           </div>
      </div>

      {
        list.length !== 0 ? (
        <div>Temp: 
        {          
          list[1].main.temp
        } °C
        </div>
        ):( <>loading....</>)
      }
      
    </div>
  );
};

export default App;