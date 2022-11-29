/**  General Helper  **/

    /** Login  **/
        const wax = new waxjs.WaxJS({
            //https://wax.eosio.online/endpoints
            rpcEndpoint: 'https://wax.greymass.com',
            isAutoLoginAvailable: true
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
            let str = '<br>Account: ' + userAccount + '<br/>Active: ' + pubKeys[0] + '<br/>Owner: ' + pubKeys[1]
            console.log(str);
            checkLogin()
        } catch (e) {
            console.log(e.message);
        }
        } 
    /****/

function resetTable() {
    $("#resultDisplay tr:not(:first-child)").remove()
}

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
async function getTemplateInfo(collection_name = "novarallywax",template_id){    
    let result;
    try {
        result = await $.ajax({
            url: '/getTemplateDetail/'+collection_name+'/'+template_id
        });
        return result.data;
    } catch (error) {
        console.error(error);
    }
}
