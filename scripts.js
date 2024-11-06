const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure session management
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
}));

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/hydrateMeApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  age: Number,
  gender: String,
  location: String,
  weight: Number,
  city: String,
  waterGoal: Number,
  interval: Number,
  waterRemaining: Number,
});

const User = mongoose.model('User', userSchema);

// Replace with your OpenWeatherMap API Key
const WEATHER_API_KEY = 'your_openweathermap_api_key';

// Helper function to fetch temperature
async function fetchTemperature(city) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );
    return response.data.main.temp; // Temperature in Celsius
  } catch (error) {
    console.error('Error fetching temperature:', error);
    return null; // Return null if there's an error
  }
}

// Calculate water goal based on weight and temperature
async function calculateWaterGoal(weight, city) {
  const temperature = await fetchTemperature(city);
  let Waterlog;

  if (weight <= 30) {
    if (temperature > 23) {
      Waterlog = 2.0;
    } else if (temperature > 20) {
      Waterlog = 1.8;
    } else {
      Waterlog = 1.6;
    }
  } else if (weight <= 50) {
    if (temperature > 23) {
      Waterlog = 2.2;
    } else if (temperature > 20) {
      Waterlog = 2.0;
    } else {
      Waterlog = 1.8;
    }
  } else if (weight <= 80) {
    if (temperature > 23) {
      Waterlog = 2.4;
    } else if (temperature > 20) {
      Waterlog = 2.2;
    } else {
      Waterlog = 2.0;
    }
  } else {
    if (temperature > 23) {
      Waterlog = 2.6;
    } else if (temperature > 20) {
      Waterlog = 2.4;
    } else {
      Waterlog = 2.2;
    }
  }

  return Waterlog * 1000; // Convert to ml
}

// Registration route
app.post('/register', async (req, res) => {
  const { username, password, name, age, gender, location, weight, city, interval } = req.body;
  const waterGoal = await calculateWaterGoal(weight, city);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: hashedPassword,
    name,
    age,
    gender,
    location,
    city,
    weight,
    waterGoal,
    interval,
    waterRemaining: waterGoal,
  });

  await user.save();
  res.json({ message: 'Account created successfully!', waterGoal });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    res.json({ message: 'Login successful', waterGoal: user.waterGoal });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Water intake route
app.post('/record-intake', async (req, res) => {
  const { username, intake } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    user.waterRemaining -= intake;
    if (user.waterRemaining <= 0) {
      res.json({ message: `Congratulations ${user.name}, you've achieved your goal!` });
      user.waterRemaining = user.waterGoal; // Reset for the next day
    } else {
      res.json({ message: `Keep going! ${user.waterRemaining} ml left to meet your daily goal.` });
    }
    await user.save();
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
