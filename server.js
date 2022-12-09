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

app.get('/getRaceListV2/:user/:nbRace',function(req,res){
    var user = req.params.user;
    var nbRace = req.params.nbRace;
    processRaceList(user,nbRace).then(async (response)=>{
        res.send(response);        
    })
});

async function processRaceList(user,nbRace){
    return new Promise((resolve) => {

        racesJS.getRaces(user,nbRace).then(async (val) => {
            array = val.data;
            //array.forEach(async race=>{
            raceArray = [];
            
            for(var i = 0; i<array.length;i++){
                //$("#loaderCount").html(i+"/"+array.length)
                //On pre construit l'array d'une race
                var tmpRace = {id : "",date : "",vehicle : {},driver : {},copilote : {},league : "",gear : "",position : "",reward : "",rewardDisplay : "",gainLost : {}};
                tmpRace.id =  array[i].race_id;

                tmpRace.date =  new Date(array[i].startedDate).toLocaleString();
                var vehicle = await assetsJS.getAssetInfo(array[i].vehicleAssetId)

                tmpRace.vehicle = vehicle;
                var driver = await assetsJS.getAssetInfo(array[i].driver1AssetId)

                tmpRace.driver = driver;
                var copilote = await assetsJS.getAssetInfo(array[i].driver2AssetId)

                tmpRace.copilote = copilote;

                tmpRace.league = array[i].league;
                tmpRace.gear = array[i].gearId;
                tmpRace.position =  array[i].position;
                //On recupère les details d'une course 
                racesJS.getRaceDetail(array[i].race_id).then((racesDetailAll) => {
                    //On recupère les infos pour notre utilisteur
                    racesDetailAll.participants.forEach(participant=>{
                        if(participant.accountName == user){
                            racesDetail = participant;
                        }
                    })     

                    var reward = {};
                    tmpReward = racesDetail.prizes;
                    
                    tmpReward.forEach(async prize=>{
                        if(prize.type == "ASSET"){
                        reward.asset_id = prize.templateId;
                
                        }
                        if(prize.type == "TOKEN"){
                        reward.charm = prize.charmTokenAmount;
                        }
                    })
                    
                    if(reward.charm != null){
                        tmpRace.rewardDisplay += "<img alt='Charm' src='https://play.novarally.io/assets/pic/CHARM.webp' width='26' height='26'><span>"+reward.charm+"</span>";

                    }
                    if(reward.asset_id != undefined){
                        prize_template = assetsJS.getTemplateInfo("novarallywax",reward.asset_id)
                        reward.asset_img = prize_template.immutable_data.img;

                        tmpRace.rewardDisplay += "<a href='https://wax.atomichub.io/explorer/template/novarallywax/"+reward.asset_id+"' target='_blank'><img src='https://atomichub-ipfs.com/ipfs/"+reward.asset_img+"' style='width: 70px;' /></a>" 
                    }

                    tmpRace.reward = reward;
                    //console.log(tmpRace.id)

                    raceArray.push(tmpRace);
                }).then(()=>{
                    if((i+1)>array.length){
                        resolve(raceArray);
                    }  
                })
            }  
        })  
    })
} 

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
//app.listen(process.env.port || 8080);
const PORT = 8080
app.listen(PORT, () => console.log(`App running on PORT ${PORT}`))