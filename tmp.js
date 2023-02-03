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



/*
Exemple of card for listing : 

<div class="col-md-3">
  <div class="card p-3 mb-2" style="background: #5c5c70;">
    <div class="d-flex justify-content-between">
      <div class="ms-2 d-flex flex-row align-items-center">
        <input type="checkbox">
        <div class="c-details">
          <p class="ms-2 mb-0">League : <span>Rookie</span></p> 
        </div>
      </div>
      <div class="badge" style="background: lightgray;height: fit-content;color: #000;">
        Pending
      </div>
    </div>
    <div class="mt-2 row text-center">
      <div class="col-4">
        <img src="https://atomichub-ipfs.com/ipfs/QmbxxSGkZAJqxyFGTNcejD35qimDyYMipgzjdiSYnuHp1L/turtle_uncommon.gif" style="width: 100%;">
        <br>Name
      </div>
      <div class="col-4">
        <img src="https://atomichub-ipfs.com/ipfs/QmQvcPNeHsfRDqzEjB9BxPnVBZsMhCGnad7jCTHWDcpccw/7_optimus_common.png" style="width: 100px;width: 100%;">
        <br>Name
      </div>
      <div class="col-4">
        <img src="https://atomichub-ipfs.com/ipfs/QmQvcPNeHsfRDqzEjB9BxPnVBZsMhCGnad7jCTHWDcpccw/7_optimus_common.png" style="width: 100px;width: 100%;">
        <br>Name
      </div>
      <div class="mt-2 col-12">
        <div>
          <p class="text1 mb-0">
            Race Cost : 
            <span class="text2">XXX Fuel</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
*/