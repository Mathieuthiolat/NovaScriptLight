const express = require('express');
const router = express.Router();
const axios = require("axios");
const ATOMICHUB_API_URL = 'https://wax.api.atomicassets.io';
module.exports = router;

const assetsJS = require("../scriptAssets");
const racesJS = require("../scriptRaces");

router.get('/allAssets/:collection_name/:userAccount', async (req, res) => {
    const { collection_name,userAccount } = req.params;
    const url = `${ATOMICHUB_API_URL}/atomicassets/v1/accounts/${userAccount}/${collection_name}`;
    console.log(url);
    try {
        const response = await axios.get(url);
        var arrAssets = {data : {totalAssets : 0}};
        var jsonCategories = response.data.data.schemas;
        var totalAssets = 0;

        jsonCategories.forEach(obj => {

            Object.entries(obj).forEach(([key, value]) => {
                console.log("la");

                if(key == "assets")
                    totalAssets += parseInt(value);
                if(key == "schema_name"){
                    arrAssets.data[value] = [];
                }
            });
        });

        arrAssets.data.totalAssets = totalAssets
        arrAssets.data.templateInfo = jsonCategories;

        var assetsListes = { success: "", data: "", query_time: "" };
        // if(totalAssets>999){
        //     var loop = Math.ceil(1205 / 999)
        //     let nbKeys = 0;
        //
        //     var batch = 999,page = 1,key="";
        //
        //     assetsListes = await  axios.get(`${ATOMICHUB_API_URL}/atomicassets/v1/accounts/${userAccount}/${collection_name}&page=${page}&limit=${batch}&order=desc&sort=asset_id`);
        //     for(let key in assetsListes.data) {++nbKeys;}
        //     batch = ((totalAssets-999)>999)?999:totalAssets-999;
        //     page++;
        //
        //     for(i=1;i<loop;i++){
        //         tmpliste = await  axios.get(`${ATOMICHUB_API_URL}/atomicassets/v1/accounts/${userAccount}/${collection_name}&page=${page}&limit=${batch}&order=desc&sort=asset_id`);
        //         for (y=0;y<nbKeys;y++){
        //             key = Object.keys(assetsListes.data)[y];
        //             console.log(assetsListes.data[key])
        //             if( type(assetsListes.data[key]) === "number"){
        //                 assetsListes.data[key] = assetsListes.data[key] + tmpliste[key]
        //
        //             }else if($.type(assetsListes.data[key]) === "array"){
        //                 assetsListes.data[key] = $.merge(ssetsListes.data[key],tmpliste[key])
        //             }
        //         }
        //         page++;
        //         batch = ((totalAssets-999)>999)?999:totalAssets-999;
        //     }
        // }else
        assetsListes = await axios.get(`${ATOMICHUB_API_URL}/atomicassets/v1/accounts/${userAccount}/${collection_name}&page=${page}&limit=${totalAssets}&order=desc&sort=asset_id`);

        $.each(assetsListes.data , function( index, assets ) {
            if(assets.schema.schema_name == "vehicles" || assets.schema.schema_name == "drivers" ){
                if(assets.schema.schema_name == "vehicles"){
                    arrAssets.data[assets.schema.schema_name].push({
                        "id":assets.asset_id,
                        "img":assets.data.img,
                        "name":assets.data.name,
                        "league":assets.data.Quality,
                        "last_free_race":assets.mutable_data["Last Free Race Date"],
                        "free_races_counter":assets.mutable_data["Free Races Counter"]
                    })
                }else{
                    arrAssets.data[assets.schema.schema_name].push({
                        "id":assets.asset_id,
                        "img":assets.data.img,
                        "name":assets.data.name,
                        "league":assets.data.Quality
                    })
                }
            }else{
                arrAssets.data[assets.schema.schema_name].push(assets.asset_id)
            }
        });

        res.render('index',  arrAssets.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/getAssetsDetail/:assets',function(req,res){
    var assets = req.params.assets
    assetsJS.getAssetInfo(assets).then((details) => {
        res.send(details);
    })
});

router.get('/getTemplateDetail/:collection_name/:template_id',function(req,res){
    var collection_name = req.params.collection_name
    var template_id = req.params.template_id
    assetsJS.getTemplateInfo(collection_name,template_id).then(async (response) => {
        res.send(response);
    })
});

router.get('/getAssets/:user_name',function(req,res){
    var user = req.params.user_name
    assetsJS.createAssetsArray(user).then((assets) => {
        res.send(assets);
    })
});

router.get('/getAssetsRuning/:user_name',function(req,res){
    var user = req.params.user_name
    racesJS.getQueueRaces().then((assets) => {
        var assetsRunning = "null";
        assets.rows.forEach(async races =>{
            if(races.player === user){
                assetsRunning = races.joins;
            }
        })
        res.send(assetsRunning);
    })
});