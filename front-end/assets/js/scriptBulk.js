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
/*var fuel = {
  rookie : "SNAKOIL",
  intermediate : "SNAKGAS",
  veteran : "SNAKPOW",
  master : "SNAKVEN"
}*/

/**  Launch race  **/
async function sign(driver1, driver2, vehicle,league) {
  return new Promise(async resolve => {
    //Get race cost with league & gear
    switch(league){
      case "rookie": fuel = "SNAKOIL"; break;
      case "intermediate": fuel = "SNAKGAS"; break;
      case "veteran": fuel = "SNAKPOW"; break;
      case "master": fuel = "SNAKVEN"; break;
    }


    try {
      if(!wax.api) {
        await login()
        logDebug("Reconnexion");
      }
      var gear = $("#gear").val() ?? 0

      console.log("Launching : "+driver1+" - "+driver2+" - Vehicle "+vehicle+" Gear "+gear)
      if(gear != 0){
        //OilCost.rookie[0]
        var oil = OilCost[league][gear-1]

        //send the oil
        const transfer = await wax.api.transact({
          actions: [{
            account: 'novarallytok',
            name: 'transfer',
            authorization: [{
              actor: sessionStorage.getItem("userAccount"),
              permission: 'active',
            }],
            data: {
              from: sessionStorage.getItem("userAccount"),
              to: 'iraces.nova',
              quantity: oil+' '+fuel,
              memo: '',
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        });
      }

      //logDebug("Send "+JSON.stringify(transfer.transaction_id, null, 2))
      //Send race
      const result = await wax.api.transact({
      actions: [{
          account: 'iraces.nova',
          name: 'join',
          authorization: [{
          actor: sessionStorage.getItem("userAccount"),
          permission: 'active',
          }],
          data: {
            driver1_asset_id: driver1,
            driver2_asset_id: driver2,
            gear_id: gear,
            player: sessionStorage.getItem("userAccount"),
            races_number: 1,
            use_boost: false,
            vehicle_asset_id: vehicle,
          },
      }]
      }, {
        blocksBehind: 3,
        expireSeconds: 1200,
      });

      logDebug("Run launched succes "+vehicle+" - "+driver1+" - "+driver2)    
      resolve('success');
    } catch(e) {
      logDebug(e.message)     
      resolve('error');

    }
    
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
