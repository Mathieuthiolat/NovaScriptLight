/**  General Helper  **/

    /** Login  **/
        const wax = new waxjs.WaxJS({
            //https://wax.eosio.online/endpoints
            rpcEndpoint: 'https://wax.greymass.com',
            isAutoLoginAvailable: true,
            tryAutoLogin: false
        });

        //normal login. Triggers a popup for non-whitelisted dapps

        async function checkLogin(){
            if(sessionStorage.getItem("userAccount") != null){
                $("#login-btn")[0].classList.add("hidden");
                $("#login-info")[0].classList.remove("hidden");
                $("#account-name")[0].innerHTML = sessionStorage.getItem("userAccount");
                return true;
            }
            else{
                return false;
            }
        }

        function disconect(){
            sessionStorage.clear();
            location.reload()
        }

        async function login() {
        try {
            //if autologged in, this simply returns the userAccount w/no popup
            let userAccount = await wax.login();
            sessionStorage.setItem('userAccount',userAccount)
            let pubKeys = wax.pubKeys;
            let str = 'Account: ' + userAccount
            console.log(str);
            checkLogin()
        } catch (e) {
            console.log(e.message);
        }
        } 
    /****/

function resetTable() {
    $("#resultDisplay tbody").remove()
}
function loop(){
    setInterval(async function() { 
        getInfos()
    }, 20000);
}
//DBG 
function logDebug(msg){
    console.log(new Date().toLocaleTimeString("fr-FR")+" DBG : "+msg)
    //Voir si besoin de log dans un fichier externe
  
}

async function getInfos(){
    laterRunningAssets().then((usedCars) => {
        laterAssets().then((totalCars) => {
            //logDebug("Use car : "+ usedCars.length)
            //logDebug("Total Car : "+totalCars.vehicles.length)
            $("#carsAvailable").html( (totalCars.vehicles.length - usedCars.length ) + " / "+ totalCars.vehicles.length )
        });
    });
}

var tokens = 
[
    {name : "oilPrice", id : "100"},
    {name : "gasPrice", id : "141"},
    {name : "powPrice", id : "152"},
    {name : "venPrice", id : "153"},
    {name : "charmPrice", id : "634"},
    {name : "boostPrice", id : "110"}
];

async function getTokensPrice(){

  tokens.forEach(async token  => {
    var tempPrice = await ajaxTokenPrice(token.id);
    token.price = tempPrice.last_price;
    $("#"+token.name).html(tempPrice.last_price)
  })
    
}
getTokensPrice()
console.log(tokens)
async function ajaxTokenPrice(token_id){    
    try {
        result = await $.ajax({
          url: 'https://wax.alcor.exchange/api/markets/'+token_id
        });
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function later(asset_id){    
    let result;
    try {
        //logDebug("Asset detail")
        result = await $.ajax({
            url: 'getAssetsDetail/'+asset_id
        });
        return result.data;
    } catch (error) {
        console.error(error);
    }
}

async function getTemplateInfo(collection_name = "novarallywax",template_id){    
    let result;
    try {
        //logDebug("Template info")

        result = await $.ajax({
            url: '/getTemplateDetail/'+collection_name+'/'+template_id
        });
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function laterRunningAssets(){    
    let resultRunning;
    try {
        //logDebug("Getting list of assets used")

        resultRunning = await $.ajax({
            url: 'getAssetsRuning/'+sessionStorage.getItem('userAccount')
        });
        return resultRunning;
    } catch (error) {
        console.error(error);
    }

}

async function laterAssets(){    

    let result;

    try {
        gearValue = $("#gear").val();
        result = await $.ajax({
            url: 'getAssets/'+sessionStorage.getItem('userAccount')
        });
        return result.data;
    } catch (error) {
        console.error(error);
    }
    
}
  