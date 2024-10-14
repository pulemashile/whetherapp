import React from 'react';
import { Link } from 'react-router-dom';

const PopiActPage = () => {
  return (
    <div>
      <h1>Protection of Personal Information (POPI Act) Policy</h1>
      <p>
        At [Your Company Name], we're committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPI Act).
      </p>

      <h2>What personal information do we collect?</h2>
      <ul>
        <li>Location data (when users grant permission)</li>
        <li>Search queries</li>
        <li>IP addresses</li>
        <li>Device information (e.g., browser type, operating system)</li>
      </ul>

      <h2>How do we use your personal information?</h2>
      <p>
        We use the collected personal information to:
      </p>
      <ul>
        <li>Provide weather forecasts and related services</li>
        <li>Improve the app's functionality and user experience</li>
        <li>Send notifications and updates (if applicable)</li>
      </ul>

      <h2>How do we protect your personal information?</h2>
      <p>
        We implement robust security measures to protect your personal information, including:
      </p>
      <ul>
        <li>Encryption</li>
        <li>Firewalls</li>
        <li>Regular software and system updates</li>
      </ul>

      <h2>Who do we share your personal information with?</h2>
      <p>
        We share personal information with the following third-party services:
      </p>
      <ul>
        <li>OpenWeatherMap API (for weather data)</li>
        <li>Google Analytics (for analytics purposes)</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        Under the POPI Act, you have the right to:
      </p>
      <ul>
        <li>Access your personal information</li>
        <li>Correct or update your personal information</li>
        <li>Object to the processing of your personal information</li>
        <li>Lodge a complaint with the Information Regulator</li>
      </ul>

      <h2>Contact us</h2>
      <p>
        If you have any questions or concerns about our POPI Act policy, please contact us at [your email address] or [your physical address].
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The last update was made on [date].
      </p>
      <Link to="/">Back to Weather App</Link>
    </div>
  );
};

export default PopiActPage;