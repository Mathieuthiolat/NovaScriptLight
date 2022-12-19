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
    var json = JSON.parse(utils.loadData("sepa.json"))

    var newJson = json.forEach(function(k,v){
      console.log(v+" / "+json.length);
      var timestamp = k.date_sepa;
      var date = new Date(timestamp * 1000).toLocaleString('fr-FR');
      //var formattedDate = Utilities.formatDate(date, 'Paris', 'dd,MM,yyyy HH:mm:ss')
      k.date_lisible = date.replace(',', ' ');
    })
    utils.storeData(json,"./sepaPretty.json");


}
load()