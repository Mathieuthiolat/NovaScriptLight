const { JsonRpc } = require('eosjs');
const https = require('https');
const fetch = require('node-fetch');
const utils = require('./utils.js');
const rpc = new JsonRpc('https://api.waxsweden.org', { fetch });

var arr = {data : []};

const getRacesOld = async () => {
  const json = await rpc.get_table_rows({
    json: true,               // Get the response as json
    code: 'iraces.nova',      // Contract that we target
    scope: 'unrsi.wam',         // Account that owns the data
    table: 'playerraces',        // Table name
    limit: 500
  });
  
  //Write json file with json as data
  utils.storeData(json,"./result/races_rawOld.json");

  //get data from jsonFile
  //const json = utils.loadData("./races_raw.json")

  return json
}

/* https://nr-api.win-win.software/api/v1/races/{race_id}/  to get detail of the race & nb of charm earn*/
async function getRaces(user="unrsi.wam",nbRaces = 200) {
  return new Promise((resolve) => {
    https.get('https://nr-api.win-win.software/api/v1/races/?currentAccount='+user+'&isCurrentOnly=true&size='+nbRaces+'&page=1', resp => {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => { 
        //console.log(JSON.parse(data).data)
        
        arr.data = editRaceArray(JSON.parse(data).data)
        console.log("save Races list")

        utils.storeData(arr,"./result/races_raw.json");
        resolve(arr)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
}

function editRaceArray(array){
  var newArr = []
  array.forEach(race => {
    race.player.startedDate = race.startedAt;
    newArr.push(race.player)
  })
  return newArr
}

async function getQueueRaces(){
  return new Promise((resolve) => {

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
        //console.log(element)
      
        if(arr.data[0] != undefined){
          let arrLength = arr.data.length - 1;
          for(i=0;i<= arrLength;i++){

            //console.log(arr.data[i]) 

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
/* swager : https://test.wax.api.atomicassets.io/docs/ */
async function getAssetInfo(asset_id) {
  return new Promise((resolve) => {
    https.get('https://wax.api.atomicassets.io/atomicassets/v1/assets/'+asset_id, resp => {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => { 
        //console.log(JSON.parse(data))
        resolve(JSON.parse(data))
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
}

module.exports = { getAllFirst,getRaces,getAssetInfo,getQueueRaces};