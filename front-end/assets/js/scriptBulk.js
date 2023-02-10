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

/**  Refuel intern storage **/
async function refuel() {
  return new Promise(async resolve => {
    try {
      if($("#fuel_amount")[0].value != undefined &&  ($("#fuel_type")[0].value != undefined || $("#fuel_type")[0].value != "0")){
        if(!wax.api) {
          await login()
          logDebug("Reconnexion");
        }
        //send the oil
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
              quantity: $("#fuel_amount")[0].value+' '+$("#fuel_type")[0].value,
              memo: '',
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        });

        showMsg("Refuel succes : "+$("#fuel_amount")[0].value+' '+$("#fuel_type")[0].value)

        logDebug("Refuel succes : "+$("#fuel_amount")[0].value+' '+$("#fuel_type")[0].value)    
        getInfos()
        resolve('success');
      }
    } catch(e) {
      logError(e.message)     
      resolve(e.message);
    }
  });
}

/**  Claim intern storage **/
async function claimToken() {
  return new Promise(async resolve => {
    try {
      if($("#claim_token_amount")[0].value != undefined && ($("#claim_token_type")[0].value != undefined && $("#claim_token_type")[0].value != "0")){
        console.log( $("#claim_token_amount")[0].value+' '+$("#claim_token_type")[0].value)

        if(!wax.api) {
          await login()
          logDebug("Reconnexion");
        }

        if($("#claim_token_type")[0].value == "CHARM"){
          //claim charm
          const claim = await wax.api.transact({
            actions: [{
              account: 'iraces.nova',
              name: 'charms.claim',
              authorization: [{
                actor: wax.userAccount,
                permission: 'active',
              }],
              data: {
                player: wax.userAccount,
              },
            }]
          }, {
            blocksBehind: 3,
            expireSeconds: 1200,
          });
        }else{
          //claim oil
          
          const claim = await wax.api.transact({
            actions: [{
              account: 'iraces.nova',
              name: 'withdraw',
              authorization: [{
                actor: wax.userAccount,
                permission: 'active',
              }],
              data: {
                owner: wax.userAccount,
                amount: $("#claim_token_amount")[0].value+' '+$("#claim_token_type")[0].value,
              },
            }]
          }, {
            blocksBehind: 3,
            expireSeconds: 1200,
          });
        }


        showMsg("Claim succes : "+$("#claim_token_amount")[0].value+' '+$("#claim_token_type")[0].value)
        logDebug("Refuel succes : "+$("#claim_token_amount")[0].value+' '+$("#claim_token_type")[0].value)    
        getInfos()
        resolve('success');
      }else{

      }

    } catch(e) {
      logError(e.message)     
      resolve(e.message);
    }
  });
}

/**  Launch race  **/
async function sign(driver1, driver2, vehicle,league,fuel=false) {
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

      //logDebug("Send "+JSON.stringify(transfer.transaction_id, null, 2))
      //Send race
      const result = await wax.api.transact({
      actions: [{
          account: 'iraces.nova',
          name: 'join',
          authorization: [{
          actor: 'unrsi.wam',
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
      logDebug("Run launched succes "+vehicle+" - "+driver1+" - "+driver2)    
      resolve('success');
    } catch(e) {
      logError(e.message)     
      resolve(e.message);

    }
    
  });
}

async function asyncCall() {
    resetTable()
    var league = $('#league-select').val() ?? "false"
    var place = $('#place-select').val() ?? "false"
    $("#loader").css("display","block")
    $.ajax({url: 'getRace/'+league+'/'+place+'/'+sessionStorage.getItem('userAccount')+'/'+10, success:function(res){
      arr = res;
    }});
    const result = await callDetail();
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
    //Vehicle
    later(val.vehicleAssetId).then((vehicle_detail) => {
      //Driver 1
      later(val.driver1AssetId).then((driver1_detail) => {
        //Driver2
        later(val.driver2AssetId).then((driver2_detail) => {
          $("#loader").css("display","none")

          display(vehicle_detail,driver1_detail,driver2_detail,league,position)
        })  
      })      
    })
  })
}

function display(vehicle_detail,driver1_detail,driver2_detail,league_val,position_val){
    const userAccount = sessionStorage.getItem('userAccount')
    if(vehicle_detail.owner == userAccount && driver1_detail.owner == userAccount && driver2_detail.owner == userAccount ){

      var vehicle = $("<td></td>").text(vehicle_detail.name);        
      var driver1 = $("<td></td>").text(driver1_detail.name);   
      var driver2 = $("<td></td>").text(driver2_detail.name);   
      var league = $("<td></td>").text(league_val);   
      var position = $("<td></td>").text(position_val);   
      var action = $("<button></button>").text("Send").attr('onclick','sign('+driver1_detail.asset_id+', '+driver2_detail.asset_id+','+vehicle_detail.asset_id+',"'+league_val+'")');   
      var row = $("<tr></tr>").append(vehicle,driver1,driver2,league,position,action);   
      $("#resultDisplay").append(row);
    }  
}

async function asyncGetAssets() {
  let result;
  try {
      result = await $.ajax({
        url: '/getAssets/'+sessionStorage.getItem('userAccount')
      });
      return result.data;
  } catch (error) {
      console.error(error);
  }

}
