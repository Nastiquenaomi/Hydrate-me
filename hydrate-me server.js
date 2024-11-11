const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createPool({
  host: 'localhost3306',
  user: 'Local instance MySQL90',        // MySQL user
  password: 'nastic',   // MySQL password
  database: 'hydrateMeApp'
});

// Replace with your OpenWeatherMap API Key
const WEATHER_API_KEY = 'f2c2661603d8f96757a81b3cfdd73892';

async function fetchTemperature(city) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );
    return response.data.main.temp;
  } catch (error) {
    console.error('Error fetching temperature:', error);
    return null;
  }
}

function calculateWaterGoal(weight, temperature) {
  let Waterlog;
  if (weight <= 30) {
    Waterlog = temperature > 23 ? 2.0 : (temperature > 20 ? 1.8 : 1.6);
  } else if (weight <= 50) {
    Waterlog = temperature > 23 ? 2.2 : (temperature > 20 ? 2.0 : 1.8);
  } else if (weight <= 80) {
    Waterlog = temperature > 23 ? 2.4 : (temperature > 20 ? 2.2 : 2.0);
  } else {
    Waterlog = temperature > 23 ? 2.6 : (temperature > 20 ? 2.4 : 2.2);
  }
  return Waterlog * 1000;
}

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(`SELECT * FROM users WHERE username = ?`, [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      req.session.user = user;
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Route to calculate water goal based on location
app.post('/calculate-water-goal', async (req, res) => {
  const { city } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  const user = req.session.user;
  const temperature = await fetchTemperature(city);
  if (temperature === null) {
    return res.status(500).json({ message: 'Could not fetch temperature data.' });
  }

  const waterGoal = calculateWaterGoal(user.weight, temperature);
  res.json({ waterGoal });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
