
var myRaces = []
var user = "";

var raceCost = {
  rookie : {
    fuel : "oilPrice",
    oil : [1800,10800,54000,270000]
  },
  intermediate : {
    fuel : "gasPrice",
    oil : [600,3600,18000,90000]
  },
  veteran : {
    fuel : "powPrice",
    oil : [200,1200,6000,30000]
  },
  master : {
    fuel : "venPrice",
    oil : [200,1200,6000,30000]
  }
};


async function asyncCall(nbRaces){    
 
  try {
      result = await $.ajax({
        url: '/getRaceList/'+user+'/'+nbRaces
      });

      return result;
  } catch (error) {
      console.error(error);
  }
}


async function createMyRaces(array){    
  return new Promise(async resolve => {
    raceArray = [];

    for(i=0;i<array.length; i++){
      $("#loaderCount").html(i+"/"+array.length)

      var tmpRace = {id : "",date : "",vehicle : {},driver : {},copilote : {},league : "",gear : "",position : "",reward : "",gainLost : {}};

      tmpRace.id =  array[i].race_id;
      tmpRace.date =  new Date(array[i].startedDate).toLocaleString();

      var vehicle = await later(array[i].vehicleAssetId);
      tmpRace.vehicle.id = vehicle.asset_id;
      tmpRace.vehicle.name = vehicle.name;
      tmpRace.vehicle.league = vehicle.league;
      tmpRace.vehicle.img = vehicle.template.immutable_data.img;

      var driver = await later(array[i].driver1AssetId);
      tmpRace.driver.id = driver.asset_id;
      tmpRace.driver.name = driver.name;
      tmpRace.driver.league = driver.league;
      tmpRace.driver.img = driver.template.immutable_data.img;

      var copilote = await later(array[i].driver2AssetId);
      tmpRace.copilote.id = copilote.asset_id;
      tmpRace.copilote.name = copilote.name;
      tmpRace.copilote.league = copilote.league;
      tmpRace.copilote.img = copilote.template.immutable_data.img;

      tmpRace.league = array[i].league;
      tmpRace.gear = array[i].gearId;
      tmpRace.position =  array[i].position;

      var racesDetail = await getRaceDetail(array[i].race_id)
     
      //tmpRace.reward = reward;
      tmpRace.reward = racesDetail;
      raceArray.push(tmpRace);

    }
    await sortDisplayRaceArray(raceArray)

    resolve('resolved');
  });
}
async function getRewardList(prizesListe){
  return new Promise(async resolve => {
    var reward = {};

    
    prizesListe.forEach(async prize=>{
      if(prize.type == "ASSET"){
        reward.asset_id = prize.templateId;

      }
      if(prize.type == "TOKEN"){
        reward.charm = prize.charmTokenAmount;
      }
    })

    resolve(reward);
  })

}



async function sortDisplayRaceArray(races){
  $("#loader")[0].classList.add("hidden");
  $("#load-more")[0].classList.remove("hidden");

  await $.get("./assets/template/result_cards.html", function(html_string){
    cardTemplate =  html_string
  })

  var globalGain = 0;
  var globalGainCharm = 0;


  for(i=0;i<races.length; i++){
    var newCard = cardTemplate;
    var positionCSS = "";

    switch(races[i].position){
      case 1: positionCSS = "style='color:#f0d148;font-size:20px;text-shadow: 1px 1px 5px #000;'"; break;
      case 2: positionCSS = "style='color:#f3e8bf;font-size:20px;text-shadow: 1px 1px 5px #000;'"; break;
      case 3: positionCSS = "style='color:#d28f2b;font-size:20px;text-shadow: 1px 1px 5px #000;'"; break;
      default:break;
    }
    //races.forEach(async element => {

    //get reward list
    reward = await getRewardList(races[i].reward.prizes);
    
    var rewardDisplay = "";
    if(reward.charm != null){

      globalGainCharm = globalGainCharm + reward.charm
      rewardDisplay += "<p><img alt='Charm' src='https://play.novarally.io/assets/pic/CHARM.webp' width='26' height='26'><span>"+reward.charm+"</span></p>";

    }
    if(reward.asset_id != undefined){

      await getTemplateInfo("novarallywax",reward.asset_id).then(prize_template=>{
        reward.asset_img = prize_template.immutable_data.img;
      });

      rewardDisplay += "<a href='https://wax.atomichub.io/explorer/template/novarallywax/"+reward.asset_id+"' target='_blank'><img src='https://atomichub-ipfs.com/ipfs/"+reward.asset_img+"' style=\"width: 100px;height: 60px;object-fit: cover;object-position: top;box-shadow: 0px 0px 5px #000;\" /></a>"
    }

    try {
      newCard = newCard.replace("[CAR_IMG]",races[i].vehicle.img)
      newCard = newCard.replace("[CAR_NAME]",races[i].vehicle.name)
      newCard = newCard.replace("[CAR_ID]",races[i].vehicle.id)

      newCard = newCard.replace("[DRIVER_IMG]",races[i].driver.img)
      newCard = newCard.replace("[DRIVER_NAME]",races[i].driver.name)
      newCard = newCard.replace("[DRIVER_ID]",races[i].driver.id)

      newCard = newCard.replace("[COPILOTE_IMG]",races[i].copilote.img)
      newCard = newCard.replace("[COPILOTE_NAME]",races[i].copilote.name)
      newCard = newCard.replace("[COPILOTE_ID]",races[i].copilote.id)


/*
      var date = $("<td></td>").html("<span>"+races[i].date+"<br>id:"+races[i].id+"</span>") ;
      var vehicleHtml = $("<td></td>").html("<img src='https://atomichub-ipfs.com/ipfs/"+races[i].vehicle.template.immutable_data.img+"' style='width: 50px;' /><br><span>"+races[i].vehicle.name+"</span>") ;
      var driverHtml = $("<td></td>").html("<img src='https://atomichub-ipfs.com/ipfs/"+races[i].driver.template.immutable_data.img+"' style='width: 50px;'/><br><span>"+races[i].driver.name+"</span>") ;
      var copiloteHtml = $("<td></td>").html("<img src='https://atomichub-ipfs.com/ipfs/"+races[i].copilote.template.immutable_data.img+"' style='width: 50px;'/><br><span>"+races[i].copilote.name+"</span>") ;
      var leagueHtml = $("<td></td>").html("<span>"+races[i].league+"</span>") ;
      var gearHtml = $("<td></td>").html("<span>"+races[i].gear+"</span>") ;
      var positionHtml = $("<td></td>").html("<span "+positionCSS+" >"+races[i].position+"</span>") ;
  
      var rewardHtml = $("<td></td>").html("<div>"+rewardDisplay+"</div>") ;
*/

      var cost = "0";
  
      if(races[i].gear != "0"){
        var fuel_id ="";
        switch(races[i].league){
          case "rookie": fuel_id = 0;break;  
          case "intermediate":fuel_id = 1;break;  
          case "veteran":fuel_id = 2;break;  
          case "master":fuel_id = 3;break;  
        }
  
        var fuelPrice = tokens[fuel_id].price
  
        var fuelAmount = raceCost[races[i].league].oil[(races[i].gear-1)]

        cost = fuelPrice * fuelAmount
  
      }
      var gainlost = (reward.charm *  tokens[4].price) - cost
  
      var gainLostHtml = gainlost.toFixed(4)+" Wax";
      
      globalGain = globalGain + gainlost

      newCard = newCard.replace("[CARD_ID]",races[i].id)
      newCard = newCard.replace("[DATE]",races[i].date)
      newCard = newCard.replace("[LEAGUE]",races[i].league)
      newCard = newCard.replace("[STATUS]","Pos.<span "+positionCSS+" >"+races[i].position+"</span>")
      newCard = newCard.replace("[GAIN]",rewardDisplay)
      newCard = newCard.replace("[GAIN/LOST]",gainLostHtml)


      var row = createElementFromHTML(newCard);
      $("#list_card").append(row);

      //var row = $("<tr class='raceRow'></tr>").append(date,vehicleHtml,driverHtml,copiloteHtml,leagueHtml,gearHtml,positionHtml,rewardHtml,gainLostHtml);
      //$("#resultDisplay").append(row);
      $("#totalGain").html(globalGain.toFixed(3));
      $("#totalGainCharm").html(globalGainCharm.toFixed(3));
      $(".currencie").css("display", "inline");
  
    } catch (error) {
      logDebug(error)
    }


  };

}

async function getRaceDetail(id_race){
  return new Promise(async resolve => {

    var temp = await $.ajax({
      url: '/getRaceDetail/'+id_race
    });

    temp.participants.forEach(participant=>{
      if(participant.accountName == user){
        resolve(participant);
      }
    })      
  })
}
