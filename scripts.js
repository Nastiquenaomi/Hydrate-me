const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const schedule = require('node-schedule');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Configure session management
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
}));

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
  waterGoal: Number,
  interval: Number,
  waterRemaining: Number,
});

const User = mongoose.model('User', userSchema);

// Registration route
app.post('/register', async (req, res) => {
  const { username, password, name, age, gender, location, weight, interval } = req.body;

  // Calculate daily water goal based on weight and store it
  const waterGoal = calculateWaterGoal(weight); 
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = new User({
    username,
    password: hashedPassword,
    name,
    age,
    gender,
    location,
    weight,
    waterGoal,
    interval,
    waterRemaining: waterGoal,
  });

  await user.save();
  res.json({ message: 'Account created successfully!' });
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
      user.waterRemaining = user.waterGoal;
    } else {
      res.json({ message: `Keep going! ${user.waterRemaining} ml left to meet your daily goal.` });
    }
    await user.save();
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Calculate water goal based on weight
function calculateWaterGoal(weight) {
  // Placeholder: replace with actual formula when provided
  return weight * 30; // e.g., 30 ml per kg
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
