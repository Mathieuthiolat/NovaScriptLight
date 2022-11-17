const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

const assetsJS = require('./scriptAssets')
const racesJS = require('./scriptRaces')
const utils = require('./utils')
//const resultRace = require('./result/selection_result.json')
require('./routes')(app,path);
app.use(express.static(__dirname + '/front-end'));

app.get('/getRace/:league/:place/:user/:nbRace',function(req,res){
    var place = req.params.place;
    var league = req.params.league;
    var user = req.params.user;
    var nbRace = req.params.nbRace;

    racesJS.getRaces(user,nbRace).then((val) => {
        racesJS.getAllFirst(val.data,place,league).then((respFirst)=> {
            res.send(respFirst);        
        })
    })
});

app.get('/getRace/:assets',function(req,res){
    var assets = req.params.assets
    racesJS.getAssetInfo(assets).then((details) => {
        res.send(details);
    })   
});

app.get('/getAssets/:user_name',function(req,res){
    var user = req.params.user_name
    assetsJS.createAssetsArray(user).then((assets) => {
        //console.log(assets)
        res.send(assets);      
    })
});
app.get('/getAssetsRuning/:user_name',function(req,res){
    var user = req.params.user_name
    racesJS.getQueueRaces().then((assets) => {
        var assetsRunning = "";
        assets.rows.forEach(async races =>{
            if(races.player == user){
                assetsRunning = races.joins;
            }
        })  
        res.send(assetsRunning);      
    })
});


//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');