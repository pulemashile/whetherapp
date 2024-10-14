import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WeatherApp from './weather';
import PopiActPage from './PopPopiActPage'; // import your PopiActPage component


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WeatherApp />} />
        <Route path="/popi-act" element={<PopiActPage />} />
      </Routes>
    </Router>
  );
};


export default App;