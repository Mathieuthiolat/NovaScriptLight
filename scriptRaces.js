const { JsonRpc } = require('eosjs');
const https = require('https');
const fetch = require('node-fetch');
const utils = require('./utils.js');
//const rpc = new JsonRpc('https://api.waxsweden.org', { fetch });
const rpcList = ["https://api.waxsweden.org","https://wax.eu.eosamsterdam.net"];

var arr = {data : []};

async function getRaces(user="unrsi.wam",nbRaces = 10,pageNb = 0) {
  return new Promise((resolve) => {
    https.get('https://nr-api.win-win.software/api/v1/races/?currentAccount='+user+'&isCurrentOnly=true&size='+nbRaces+'&page='+pageNb, resp => {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => { 
        
        arr.data = editRaceArray(JSON.parse(data).data)
        resolve(arr)
      });

    }).on("error", (err) => {
      utils.storeData(new Date().toLocaleTimeString("fr-FR")+" SERVER SIDE : "+err.message,"./logs/error.json")
    });
  })
}

/* https://nr-api.win-win.software/api/v1/races/{race_id}/  to get detail of the race & nb of charm earn*/
async function getRaceDetail(race_id) {
  return new Promise((resolve) => {
    https.get('https://nr-api.win-win.software/api/v1/races/'+race_id+"/", resp => {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(JSON.parse(data).data)
       });

    }).on("error", (err) => {
      utils.storeData(new Date().toLocaleTimeString("fr-FR")+" SERVER SIDE : "+err.message,"./logs/error.json")
    });
  })
}

function editRaceArray(array){
  var newArr = []
  array.forEach(race => {
    race.player.race_id = race.id;
    race.player.startedDate = race.startedAt;
    newArr.push(race.player)
  })
  return newArr
}

async function getQueueRaces(rpcKey){
  return new Promise((resolve) => {
    var rpc = new JsonRpc(rpcList[rpcKey], { fetch });

    const json = rpc.get_table_rows({
      json: true,               // Get the response as json
      code: 'iraces.nova',      // Contract that we target
      scope: 'iraces.nova',         // Account that owns the data
      table: 'queue',        // Table name
      limit: 200
    });
    resolve(json)
  })
}



const getAllFirst = async (lsJson = "", position = "false",league = "false") => {


  lsJson.forEach(element => {
    let jump = false
    if(element.position == position || position == "false"){
      if(element.league  == league || position == "false"){
        element.count = 1;
      
        if(arr.data[0] != undefined){
          let arrLength = arr.data.length - 1;
          for(i=0;i<= arrLength;i++){

            if(arr.data[i].vehicle_asset_id == element.vehicle_asset_id && arr.data[i].driver1_asset_id == element.driver1_asset_id && arr.data[i].driver2_asset_id == element.driver2_asset_id){
              
              jump = true
              arr.data[i].count++;
            
            } 
          }
          if(!jump){
            arr.data.push(element)
          }        
        }else{
          arr.data.push(element)
        }
      }
    } 
  });
  return arr;
}

module.exports = { getAllFirst,getRaces,getRaceDetail,getQueueRaces};