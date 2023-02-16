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
                $("#set_up_bulk").prop("disabled",false)
                $("#launch_races").prop("disabled",false)
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
                $("#login-btn")[0].classList.add("hidden");
                $("#login-info")[0].classList.remove("hidden");
                $("#account-name")[0].innerHTML = sessionStorage.getItem("userAccount");
                checkLogin()
            } catch (e) {
                utils.storeData(new Date().toLocaleTimeString("fr-FR")+" SERVER SIDE : "+err.message,"./logs/error.json")
            }
        } 
    /****/

function resetTable() {
    $("#select_all").prop("disabled",true)
    $(".currencie").css("display", "none");;
    $("#list_card").empty();
    $("#totalGain").html("0")
    $("#totalGainCharm").html("0")
    $("#resultDisplay tbody").remove()
}

function loop(){
    setInterval(async function() { 
        getInfos()
    }, 60000);
}

//DBG 
function logDebug(msg){
    console.log(new Date().toLocaleTimeString("fr-FR")+" DBG : "+msg)
    //Voir si besoin de log dans un fichier externe
}
function logError(msg){
    msgDetail = msg
    $.ajax({
        url: 'logError/'+msgDetail
    });
    console.log(msgDetail)
    //Voir si besoin de log dans un fichier externe
}

async function getInfos(){
    runningAssets().then((usedCars) => {
        laterAssets().then((totalCars) => {

            //logDebug("Total Car : "+totalCars.vehicles.length)
            $("#carsAvailable").html( (totalCars.vehicles.length - usedCars.length ) + " / "+ totalCars.vehicles.length )
        });
    });
    innerBalance().then((resources)=>{
        if(!resources)
            return;
        var elements = Array.from($(".innerBalance"))

        $(".innerBalance[data-tokenname='BOOST']")[0].childNodes[1].innerHTML = resources.boost_balance;
        resources = resources.balances;
        for (let index = 0; index < resources.length; index++) {
            var tokenDesc = elements.find(item => item.dataset.tokenname === resources[index].key);

            if(tokenDesc != undefined){
                if(resources[index].key == "CHARM")
                    resources[index].value = Math.round((resources[index].value / 1000) * 10) / 10;
                    
                tokenDesc.childNodes[1].title = (resources[index].value)                   

                if(resources[index].value>=1000000)
                    tokenDesc.childNodes[1].innerHTML = parseFloat((resources[index].value / 1000000)).toFixed(1)+"m"                                   
                else if(resources[index].value>=1000)
                    tokenDesc.childNodes[1].innerHTML = parseFloat((resources[index].value / 1000)).toFixed(1)+"k"      
                else             
                    tokenDesc.childNodes[1].innerHTML = parseFloat(resources[index].value).toFixed(1)                 
            }
        }
    })
    novaTokens().then((userTokenArray)=>{
        if(userTokenArray!=null){
            var walletDiv = Array.from($(".walletBalance"))
            for (let index = 0; index < userTokenArray.length; index++) {
                var token = userTokenArray[index].split(" ")
                var tokenDesc = walletDiv.find(item => item.dataset.tokenname === token[1]);

                token[0] = parseInt(token[0])

                if(tokenDesc != undefined){
                    tokenDesc.childNodes[1].title = (token[0])                   

                    if(token[0]>=1000000)
                        tokenDesc.childNodes[1].innerHTML = parseFloat((token[0] / 1000000)).toFixed(1)+"m"                   
                    else if(token[0]>=1000)
                        tokenDesc.childNodes[1].innerHTML = parseFloat((token[0] / 1000)).toFixed(1)+"k"                   
                    else             
                        tokenDesc.childNodes[1].innerHTML = parseFloat(token[0]).toFixed(1)                 
                }
            }
        }
    })
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

//Get detail of and asset by is id
async function later(asset_id){    
    let result;
    try {  
        result = await $.ajax({
            url: 'getAssetsDetail/'+asset_id
        });
        return result.data;
    } catch (error) {
        console.error(error);
    }
}

//Get detail of a template by is template_id
async function getTemplateInfo(collection_name = "novarallywax",template_id){    
    let result;
    try {
        result = await $.ajax({
            url: '/getTemplateDetail/'+collection_name+'/'+template_id
        });
        return result;
    } catch (error) {
        console.error(error);
    }
}

//Get list of assets begin used
async function runningAssets(){    
    let resultRunning;
    try {
        resultRunning = await $.ajax({
            url: 'getAssetsRuning/'+sessionStorage.getItem('userAccount')+'/'+$("#endpoint")[0].value
        });
        return resultRunning;
    } catch (error) {
        logError(error+" user "+sessionStorage.getItem('userAccount'))
        console.error(error);
    }
}

//Get list of inner resources
async function innerBalance(){    
    let innerBalance;
    try {
        innerBalance = await $.ajax({
            url: 'getInnerBalance/'+sessionStorage.getItem('userAccount')+'/'+$("#endpoint")[0].value
        });
        if(innerBalance.balances != null || innerBalance.balances != undefined)
            return innerBalance;
        else
            return false;

    } catch (error) {
        console.error(error);
    }
}

//Get list of novarally token
async function novaTokens(){    
    let userTokenArray;
    try {
        userTokenArray = await $.ajax({
            type: "POST",
            url: "https://api.waxsweden.org:443/v1/chain/get_currency_balance",
            data: '{"code":"novarallytok","account": "'+sessionStorage.getItem('userAccount')+'","symbol": null}',
            dataType: "json"
        });
        return userTokenArray;
    } catch (error) {
        console.error(error);
    }
}

//Get all assets from the novarallywax collection 
async function laterAssets(collection_name = "novarallywax",user=sessionStorage.getItem('userAccount')){
    logError("call total asset  waxwapiatomicassetsio w "+user)
    try {
        var Assets = await $.getJSON('https://wax.api.atomicassets.io/atomicassets/v1/accounts/'+user+'/'+collection_name);
        var arrAssets = {data : {totalAssets : 0}};
        var totalAssets = 0;

        try {
            var jsonCategories = Assets.data.schemas;
  
            jsonCategories.forEach(obj => {
              Object.entries(obj).forEach(([key, value]) => {
                if(key == "assets")
                  totalAssets +=  parseInt(value);
                if(key == "schema_name"){
                  arrAssets.data[value] = [];
                }
              });
            });
    
            arrAssets.data.totalAssets = totalAssets
            arrAssets.data.templateInfo = jsonCategories;

        } catch (error) {
            console.error(error);
        }

        logError("call asset detail waxwapiatomicassetsio w "+user+"  total assets  "+totalAssets)
        var assetsListes = await $.getJSON('https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name='+collection_name+'&owner='+user+'&page=1&limit='+totalAssets+'&order=desc&sort=asset_id');   

        $.each(assetsListes.data , function( index, assets ) {
            if(assets.schema.schema_name == "vehicles" || assets.schema.schema_name == "drivers" ){
                if(assets.schema.schema_name == "vehicles"){
                    arrAssets.data[assets.schema.schema_name].push({
                        "id":assets.asset_id,
                        "img":assets.data.img,
                        "name":assets.data.name,
                        "league":assets.data.Quality,
                        "last_free_race":assets.mutable_data["Last Free Race Date"],
                        "free_races_counter":assets.mutable_data["Free Races Counter"]
                    })
                }else{
                    arrAssets.data[assets.schema.schema_name].push({
                        "id":assets.asset_id,
                        "img":assets.data.img,
                        "name":assets.data.name,
                        "league":assets.data.Quality
                    })       
                }
            }else{
                arrAssets.data[assets.schema.schema_name].push(assets.asset_id)
            }
        });
        
        
        return arrAssets.data
        
    } catch (error) {
        logError(error+" user "+user)
    }
    
}

var svg = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;"><symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></symbol><symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></symbol><symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></symbol></svg>' 
var popError = '<div id="popError" role="alert" style="position: absolute;z-index: 999;top: 15px;right: 50%;transform: translate(50%,0);" class="alert alert-danger d-flex align-items-center fade"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"></use></svg><div id="errorMsg"></div></div>    ';
var popSuccess = '<div id="popSuccess" style="position: absolute;z-index: 999;top: 15px;right: 50%;transform: translate(50%,0);" class="alert alert-primary d-flex align-items-center fade" role="alert"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg><div id="successMsg"></div></div>';

$( "body" ).append( svg );
$( "body" ).append( popError );
$( "body" ).append( popSuccess );

function showMsg(message="",type="success"){
    var target;

    if(type == "error"){
        $( "#errorMsg" )[0].innerHTML = message;      
        target =  $( "#popError" );
    }else{
        $( "#successMsg" )[0].innerHTML = message;         
        target =  $( "#popSuccess" );

    }
    target.removeClass("fade")
    target.addClass("show")

    setTimeout(() => {
        target.removeClass("show")
        target.addClass("fade")
    }, 5000);
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}