module.exports = function(app,path){

    /* Index */
    app.get('/',function(req,res){
        res.sendFile(path.join(__dirname+'/front-end/index.html'));
    });
    /* BulkRace */
    app.get('/bulk-race',function(req,res){
        res.sendFile(path.join(__dirname+'/front-end/bulk-race.html'));
    });

    /* JS */
    app.get('/node/script-table',function(req,res){
        res.sendFile(path.join(__dirname+'/node_modules/smart-webcomponents/source/modules/smart.table.js'));
    });
}