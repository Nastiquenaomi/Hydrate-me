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
  res.render('login', {emailExists: true, isPasswordCorrect: true});
});

app.get('/calculator', (req, res) => {
    res.render('calculator', { waterGoalValue: 0, temperature: currentTemperature });
});


app.get('/result', (req, res) => {
  res.render('result');
});

app.get('/signup', (req, res) => {
  res.render('signup', { userExists: false , emailExists: false, passwordMatch: true});
});

app.get('/reminder', (req, res) => {
    res.render('reminder', { 
        waterGoalValue: waterGoalValue, 
        temperature: currentTemperature, 
        interval: userInterval 
    });  
});
  

// **Sign-Up Route**
app.post('/signup', async (req, res) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password, 
        confirmPassword: req.body.confirmPassword
    };
  

        // Check if username already exists
        const existingUser = await collections.findOne({ username: data.username });

        // Check if email already exists
        const existingEmail = await collections.findOne({ email: data.email });

        const passwordMatch = (data.password == data.confirmPassword);

        if (existingUser && existingEmail && passwordMatch) {
            // Username exists
            return res.render('signup', { userExists: true, emailExists: true, passwordMatch: true }); 
        }     

        else if (!existingUser && existingEmail && passwordMatch) {
            // Username exists
            return res.render('signup', { userExists: false, emailExists: true, passwordMatch: true }); 
        }

        else if (existingUser && !existingEmail && passwordMatch) {
            // Username exists
            return res.render('signup', { userExists: true, emailExists: false, passwordMatch: true }); 
        }

        else if (existingUser && existingEmail && !passwordMatch) {
            // Username exists
            return res.render('signup', { userExists: true, emailExists: true, passwordMatch: false }); 
        }

        else if (!existingUser && !existingEmail && !passwordMatch) {
            // Username exists
            return res.render('signup', { userExists: false, emailExists: false, passwordMatch: false }); 
        }
       

        else if (existingUser && !existingEmail && !passwordMatch) {
            // Username exists
            return res.render('signup', { userExists: true, emailExists: false, passwordMatch: false }); 
        }
            
        else if (!existingUser && existingEmail && !passwordMatch) {
            // Username exists
            return res.render('signup', { userExists: false, emailExists: true, passwordMatch: false }); 
        }

        else{
       // Hash the password before saving it to the database
       const hashedPassword = await bcrypt.hash(data.password, 10); // 10 is the salt rounds
        
       refinedData = {
        username: data.username,
        email: data.email,
        password: hashedPassword    
       }
        // Insert user into the database
        const newUser = await collections.insertMany(refinedData);
        
        console.log('New User Created:', newUser);

        // Redirect or respond after successful signup
        res.redirect('/calculator'); 
        }

});


// **Login Route**
app.post('/login', async (req, res) => {

        // Find user by email
        const existingEmail = await collections.findOne({email: req.body.email});

        // Compare hashed passwords
        const correctPassword = await bcrypt.compare(req.body.password, existingEmail.password);
    
        if (!existingEmail && !isPasswordCorrect){
            return res.render('login', {emailExists: false, isPasswordCorrect: false});
        } 

        if (!existingEmail) {
            return res.render('login', {emailExists: false, isPasswordCorrect: true});
        }
        
        else if (!correctPassword) {
            return res.render('login', {emailExists: true, isPasswordCorrect: false});
        }
        else {

        res.redirect("/calculator");
        }
});
 
// Default temperature value
let currentTemperature = 0;

// Weather API call to get current temperature
async function getWeather(city) {
    const apiKey = process.env.WEATHER_API_KEY; // Add your API key in .env file
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await axios.get(apiUrl);
        return response.data.main.temp; // returns temperature in Celsius
    } catch (error) {
        console.error("Error fetching weather data:", error);
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
app.post('/calculator', async (req, res) => {
    const city = req.body.city; // User provides a city
    const temperature = await getWeather(city); // Fetch temperature for the city

    if (temperature !== null) {
        currentTemperature = temperature;
        console.log("Successfully set the temperature");
    } else {
        console.log('Failed to fetch weather data');
    }   

   // Replace with actual weight logic (e.g., stored in session or DB)
    const userWeight = req.body.weight;
    const userInterval = req.body.interval;
    const waterGoalValue = calculateWaterGoal(userWeight, currentTemperature);

    res.render('reminder', { 
        waterGoalValue: waterGoalValue, 
        temperature: currentTemperature, 
        interval: userInterval 
    });});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});


