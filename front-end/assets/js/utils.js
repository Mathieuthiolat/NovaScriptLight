/**  General Helper  **/
function resetTable() {
    $("#resultDisplay tr:not(:first-child)").remove()
}

async function later(asset_id){    
    let result;
    try {
        result = await $.ajax({
            url: 'getRace/'+asset_id
        });
        return result.data;
    } catch (error) {
        console.error(error);
    }
}
