const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const collections = require("./db"); // Updated to use the correct MongoDB model
const session = require('express-session');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'Public')));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Configure session management
app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false,
}));

app.get('/', (req, res) => {
  res.render('homepage');
});

app.get('/location', (req, res) => {
  res.render('location');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/result', (req, res) => {
  res.render('result');
});

app.get('/signup', (req, res) => {
  res.render('signup', { userExists: false , emailExists: false});
});


// **Sign-Up Route**     
// **Sign-Up Route**
app.post('/signup', async (req, res) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };

    try {
        // Check if username already exists
        const existingUser = await collections.findOne({ username: data.username });

        // Check if email already exists
        const existingEmail = await collections.findOne({ email: data.email });

        if (existingUser) {
            // Username exists
            return res.render('signup', { userExists: true, emailExists: false }); 
        }

        if (existingEmail) {
            // Email exists
            return res.render('signup', { userExists: false, emailExists: true }); 
        }

        // Insert user into the database
        const newUser = await collections.insertOne(data); // Use `insertOne` for single documents
        console.log('New User Created:', newUser);

        // Redirect or respond after successful signup
        res.redirect('/register'); // Change '/success' to the desired route after signup
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});


// **Login Route**
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).send("All fields are required!");
    }

    try {
        // Find user by email
        const user = await collections.findOne({ email });
        if (!user) {
            return res.status(400).send("Invalid email or password!");
        }

        // Compare hashed passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid email or password!");
        }

        // Store user in session
        req.session.user = { email };

        res.status(200).send("Login successful!");
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("Internal server error.");
    }
});



// Replace with your OpenWeatherMap API Key
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'f2c2661603d8f96757a81b3cfdd73892';

// Helper function to fetch temperature
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

// Calculate water goal based on weight and temperature
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
    return Waterlog * 1000; // Convert to ml
}


// Route to calculate water goal based on location
app.post('/calculate-water-goal', async (req, res) => {
    const { city } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const temperature = await fetchTemperature(city);
    if (temperature === null) {
        return res.status(500).json({ message: 'Could not fetch temperature data.' });
    }

    // Replace with actual weight logic (e.g., stored in session or DB)
    const userWeight = 70; // Example static weight
    const waterGoal = calculateWaterGoal(userWeight, temperature);
    res.json({ waterGoal });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
