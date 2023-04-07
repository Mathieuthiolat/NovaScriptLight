const express = require('express');
const router = express.Router();
module.exports = router;

const racesJS = require("../scriptRaces");

router.get('/getRaceDetail/:race_id',function(req,res){
    var race_id = req.params.race_id;

    racesJS.getRaceDetail(race_id).then((race) => {

        res.send(race);
    })
});

router.get('/getRaceList/:user/:nbRace',function(req,res){
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