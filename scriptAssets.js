const { JsonRpc } = require('eosjs');
const https = require('https');
const fetch = require('node-fetch');
const utils = require('./utils.js');
const rpc = new JsonRpc('https://api.waxsweden.org', { fetch });
const waxRpc = [
  "https://atomic.wax.eosrio.io/atomicassets/v1/",
  "https://wax.api.atomicassets.io/atomicassets/v1/"
]
var arrAssets = {data : {}};


/* swager : https://test.wax.api.atomicassets.io/docs/ */
async function getAssetNumber(user) {
  return new Promise((resolve) => {
    https.get(waxRpc[1]+'accounts/'+user+'/novarallywax', resp => {
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
    var url = waxRpc[1]+"assets?collection_name=novarallywax&owner="+user+"&page=1&limit="+totalAssets+"&order=desc&sort=asset_id"
    https.get(url, resp => {
      console.log(url)
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => { 
        arrAssets.data = editAssetsArray(JSON.parse(data).data)
        console.log("save assets list")
        utils.storeData(arrAssets.data,"./result/assets_list.json");
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

/*
var userName = "unrsi.wam"

createAssetsArray(userName).then((resp) => {
  
  utils.storeData(resp,"./result/myAssets.json");

})
*/
module.exports = {createAssetsArray };