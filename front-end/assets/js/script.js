const wax = new waxjs.WaxJS({
    //https://wax.eosio.online/endpoints
    rpcEndpoint: 'https://wax.greymass.com',
    isAutoLoginAvailable: true
});

//normal login. Triggers a popup for non-whitelisted dapps

async function login() {
  try {
    //if autologged in, this simply returns the userAccount w/no popup
    let userAccount = await wax.login();
    sessionStorage.setItem('userAccount',userAccount)
    let pubKeys = wax.pubKeys;
    $("#login-btn")[0].classList.add("hidden");
    $("#btnSetBulk")[0].classList.remove("hidden");

    $("#account-name")[0].innerHTML = userAccount;
    let str = '<br>Account: ' + userAccount + '<br/>Active: ' + pubKeys[0] + '<br/>Owner: ' + pubKeys[1]
    console.log(str);
  } catch (e) {
    console.log(e.message);
  }
} 

var OilCost = {
  rookie : [
    1800,10800,54000,270000
  ],
  intermediate : [
    600,3600,18000,90000,
  ],
  veteran : [
    200,1200,6000,30000
  ],
  master : [
    200,1200,6000,30000
  ]
}


/**  Get data from  **/
async function sign(driver1, driver2, vehicle,league) {
  return new Promise(async resolve => {
    switch(league){
      case "rookie": fuel = "SNAKOIL"; break;
      case "intermediate": fuel = "SNAKGAS"; break;
      case "veteran": fuel = "SNAKPOW"; break;
      case "master": fuel = "SNAKVEN"; break;
    }
    var gear = $('#gear-select').val() ?? 1

    //OilCost.rookie[0]
    var oil = OilCost[league][gear-1]

    try {
      if(!wax.api) {
        await login()
        console.log("DBG : Reconnexion");
        //return document.getElementById('response').append('* Login first *');
      }
      console.log("Launch : D1 "+driver1+" - D2 "+driver2+" - Vehicle "+vehicle+" league & cost "+oil+' '+fuel+" gear "+gear)
      
      const transfer = await wax.api.transact({
        actions: [{
          account: 'novarallytok',
          name: 'transfer',
          authorization: [{
            actor: wax.userAccount,
            permission: 'active',
          }],
          data: {
            from: wax.userAccount,
            to: 'iraces.nova',
            quantity: oil+' '+fuel,
            memo: '',
          },
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 1200,
      });
      document.getElementById('response').append("Send "+JSON.stringify(transfer.transaction_id, null, 2))
      const result = await wax.api.transact({
      actions: [{
          account: 'iraces.nova',
          name: 'join',
          authorization: [{
          actor: wax.userAccount,
          permission: 'active',
          }],
          data: {
            driver1_asset_id: driver1,
            driver2_asset_id: driver2,
            gear_id: gear,
            player: wax.userAccount,
            races_number: 1,
            use_boost: false,
            vehicle_asset_id: vehicle,
          },
      }]
      }, {
        blocksBehind: 3,
        expireSeconds: 1200,
      });
      console.log("DBG : Launched !")

      $('#response').html($('#response').html()+"Run launched succes "+vehicle+" - "+driver1+" - "+driver2+" <br>")     

    } catch(e) {
      $('#response').html($('#response').html()+" "+e.message+"<br>")     
    }
    resolve('resolved');
  });
}

async function asyncCall() {
    resetTable()
    var league = $('#league-select').val() ?? "false"
    var place = $('#place-select').val() ?? "false"
    console.log('DBG : calling league : '+league+" place : "+place);
    $("#loader").css("display","block")
    $.ajax({url: 'getRace/'+league+'/'+place+'/'+sessionStorage.getItem('userAccount')+'/'+10, success:function(res){
      arr = res;
    }});
    const result = await callDetail();
    //console.log(result);
}

function callDetail(){
    return new Promise(resolve => {
      setTimeout(() => {
        var array = arr.data.sort(function (a, b) {
          return a.position - b.position;
        });

        getDetail(array);
        resolve('resolved');
      }, 2000);
    });
}

function getDetail(array){
  jQuery.each( array, function( i, val ) {
    var league = val.league;
    var position = val.position;
    //console.log(val.vehicleAssetId)
    //Vehicle
    later(val.vehicleAssetId).then((vehicle_detail) => {
      //Driver 1
      later(val.driver1AssetId).then((driver1_detail) => {
        //Driver2
        later(val.driver2AssetId).then((driver2_detail) => {
          $("#loader").css("display","none")
          //console.log("here") 
          //console.log(vehicle_detail)
          display(vehicle_detail,driver1_detail,driver2_detail,league,position)
        })  
      })      
    })
  })
}

function display(vehicle_detail,driver1_detail,driver2_detail,league_val,position_val){
    //console.log("Display race info")
    const userAccount = sessionStorage.getItem('userAccount')
    //console.log(vehicle_detail  )
    if(vehicle_detail.owner == userAccount && driver1_detail.owner == userAccount && driver2_detail.owner == userAccount ){

      var vehicle = $("<td></td>").text(vehicle_detail.name);        
      var driver1 = $("<td></td>").text(driver1_detail.name);   
      var driver2 = $("<td></td>").text(driver2_detail.name);   
      var league = $("<td></td>").text(league_val);   
      var position = $("<td></td>").text(position_val);   
      var action = $("<button></button>").text("Send").attr('onclick','sign('+driver1_detail.asset_id+', '+driver2_detail.asset_id+','+vehicle_detail.asset_id+',"'+league_val+'")');   
      var row = $("<tr></tr>").append(vehicle,driver1,driver2,league,position,action);   
      //console.log("ici")
      $("#resultDisplay").append(row);
    }  
}

async function asyncGetAssets() {
  let result;
  try {
      result = await $.ajax({
        url: '/getAssets/'+sessionStorage.getItem('userAccount')
      });
      console.log(result.data)
      return result.data;
  } catch (error) {
      console.error(error);
  }

}

function logDebug(msg){
  console.log("DBG : "+msg)
  //Voir si besoin de log dans un fichier externe

}