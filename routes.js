module.exports = function(app,path){

    /* Index */
    app.get('/',function(req,res){
        var PiwikTracker = require('piwik-tracker');

        // Initialize with your site ID and Matomo URL
        var piwik = new PiwikTracker(1, 'http://localhost:8080/piwik.php');

        // Matomo works with absolute URLs, so you have to provide protocol and hostname
        var baseUrl = 'http://localhost:8080/';

        // Track a request URL: 
        piwik.track(baseUrl + req.url);

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