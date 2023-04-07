const express = require('express');
const axios = require('axios');
const app = express();
const hbs = require('hbs');


const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = '43496fe3bf2842ef412c47a5a5a7ae8e';

app.set('view engine', 'hbs');

app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;
    const url = `${WEATHER_API_URL}/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`;
    try {
        const response = await axios.get(url);
        const { name: cityName, weather, main: { temp } } = response.data;
        res.render('weather', { cityName, weather: weather[0].description, temp });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});