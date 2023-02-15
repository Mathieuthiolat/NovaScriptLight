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

app.get('/getRaceDetail/:race_id',function(req,res){
    var race_id = req.params.race_id;

    racesJS.getRaceDetail(race_id).then((race) => {

        res.send(race);
    })
});

app.get('/getRaceList/:user/:nbRace',function(req,res){
    var place = req.params.place;
    var league = req.params.league;
    var user = req.params.user;
    var nbRace = req.params.nbRace;

    racesJS.getRaces(user,nbRace).then((val) => {
        res.send(val);        
        //racesJS.getAllFirst(val.data,place,league).then((respFirst)=> {
        //})
    })
});

app.get('/getAssetsDetail/:assets',function(req,res){
    var assets = req.params.assets
    assetsJS.getAssetInfo(assets).then((details) => {
        res.send(details);
    })   
});

app.get('/getTemplateDetail/:collection_name/:template_id',function(req,res){
    var collection_name = req.params.collection_name
    var template_id = req.params.template_id
    assetsJS.getTemplateInfo(collection_name,template_id).then(async (response) => {
        res.send(response);
    })   
});

app.get('/getAssets/:user_name',function(req,res){
    var user = req.params.user_name
    assetsJS.createAssetsArray(user).then((assets) => {
        res.send(assets);      
    })
});
app.get('/getAssetsRuning/:user_name/:rpc',function(req,res){
    var user = req.params.user_name
    var rpc = req.params.rpc
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

app.get('/getInnerBalance/:user_name/:rpc',function(req,res){
    var user = req.params.user_name
    var rpc = req.params.rpc
    assetsJS.getInnerBalance(user).then((innerBalance) => {
        res.send(innerBalance.rows[0]);      
    })
});

app.get('/logError/:data',function(req,res){
    var data = req.params.data
    utils.storeData(data,"./logs/error.json");
});



//add the router
app.use('/', router);
//app.listen(process.env.port || 8080);
const PORT = 8080;
app.listen(PORT, () => console.log(`App running on PORT ${PORT}`))