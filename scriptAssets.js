const { JsonRpc } = require('eosjs');
const https = require('https');
const fetch = require('node-fetch');
const utils = require('./utils.js');
const rpc = new JsonRpc('https://api.waxsweden.org', { fetch });
var waxRpc = "https://atomic.wax.eosrio.io/atomicassets/v1/";

var arrAssets = {data : {}};

/* swager : https://test.wax.api.atomicassets.io/docs/ */
async function getAssetNumber(user) {
  return new Promise((resolve) => {
    https.get(waxRpc+'accounts/'+user+'/novarallywax', resp => {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => { 
        try {
          var jsonCategories = JSON.parse(data).data.schemas;

          var totalAssets = 0;
          arrAssets.data.totalAssets = 0;
          jsonCategories.forEach(obj => {
            Object.entries(obj).forEach(([key, value]) => {
              if(key == "assets")
                totalAssets +=  parseInt(value);
              if(key == "schema_name"){
                /*var tmpArr = [value] : ''
                arrAssets.data.push(tmpArr)*/
                arrAssets.data[value] = [];
              }
            });
          });
  
          arrAssets.data.totalAssets = totalAssets
          arrAssets.data.templateInfo = jsonCategories;
          //console.log(arrAssets.templateInfo)
          resolve(arrAssets)
        } catch (error) {
          getAssetNumber(user)
        }

      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
}

async function getAllAssets(totalAssets,user){
  return new Promise((resolve) => {
    var url = waxRpc+"assets?collection_name=novarallywax&owner="+user+"&page=1&limit="+totalAssets+"&order=desc&sort=asset_id"
    https.get(url, resp => {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => { 
        arrAssets.data = editAssetsArray(JSON.parse(data).data)
        resolve(arrAssets)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
}

function editAssetsArray(array){
  var newArr = arrAssets.data;
  array.forEach(assets => {
    newArr[assets.schema.schema_name].push(assets.asset_id)  
  })
  return newArr
}


async function createAssetsArray(userName){
  return new Promise((resolve) => {
    getAssetNumber(userName).then((resp) => {
      getAllAssets(resp.data.totalAssets,userName).then((result)=>{
        //console.log(result)
        arrAssets = result;
        
        resolve(result)
      })
    })
  })
}
/* swager : https://test.wax.api.atomicassets.io/docs/ */
async function getAssetInfo(asset_id) {
  return new Promise((resolve) => {
    console.log("Get assets "+asset_id+" : "+new Date().toLocaleString("fr-FR"))

    https.get('https://wax.api.atomicassets.io/atomicassets/v1/assets/'+asset_id, resp => {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => { 
        //console.log(JSON.parse(data))
        console.log("Detail OK : "+new Date().toLocaleString("fr-FR"))

        resolve(JSON.parse(data))
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
}

async function getTemplateInfo(collection_name,template_id) {
  return new Promise((resolve) => {
    https.get('https://wax.api.atomicassets.io/atomicassets/v1/templates/'+collection_name+"/"+template_id+"/", resp => {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => { 
        //console.log(JSON.parse(data))
        resolve(JSON.parse(data).data)
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
}

module.exports = {createAssetsArray,getAssetInfo,getTemplateInfo};