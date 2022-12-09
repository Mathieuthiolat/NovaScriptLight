const utils = require('./utils.js');


function myFunction() {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var Avals = ss.getRange("A1:A").getValues();
    var Alast = Avals.filter(String).length;
    for(i=2;i<Alast;i++){
      var timestamp = ss.getRange(i, 3).getValue();
      if(ss.getRange(i, 4).getValue() != "" ) continue;
      var date = new Date(timestamp * 1000);
  
      var formattedDate = Utilities.formatDate(date, 'Paris', 'dd,MM,yyyy HH:mm:ss')
  
      ss.getRange(i, 4).setValue(formattedDate);
    }
  }

  
  function load(){
    var json = JSON.parse(utils.loadData("csvjson.json"))

    var newJson = json.forEach(element => {
        var timestamp = element.date_sepa;
        console.log(timestamp)
        var date = new Date(timestamp * 1000).toLocaleString('fr-FR');
        //var formattedDate = Utilities.formatDate(date, 'Paris', 'dd,MM,yyyy HH:mm:ss')
        console.log(date)
        element.date_lisible = date;
    })
    console.log(newJson)
    utils.storeData(json,"./myAssets.json");


}
//load()