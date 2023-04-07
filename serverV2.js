const express = require('express');
const app = express();
const ejs = require('ejs');

app.set('view engine', 'ejs');

// Importer les routeurs
const mainRouter = require('./routes/main');
const assetsRouter = require('./routes/assets');
const racesRouter = require('./routes/races');
const userRouter = require('./routes/users');

// Utiliser le routeur global
app.use('/', mainRouter);
// Utiliser le routeur pour les assets
app.use('/assets', assetsRouter);
// Utiliser le routeur pour les races
app.use('/races', racesRouter);
// Utiliser le routeur pour les users
app.use('/users', userRouter);

app.use(express.static(__dirname + '/views/assets'));


//app.listen(process.env.port || 8080);
const PORT = 8080;
app.listen(PORT, () => console.log(`App running on PORT ${PORT}`))