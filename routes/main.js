const express = require('express');
const router = express.Router();
module.exports = router;

const utils = require("../utils");

router.get('/',function(req,res){
    res.render('index');
});

/*
/!* HtmlPage *!/
router.get('/:page', function(req , res){
    res.render(req.params.page);
});
*/

/* Server logs */
router.get('/logError/:data',function(req,res){
    var data = req.params.data
    utils.storeData(new Date().toLocaleString("fr-FR")+" : "+data,"./logs/error.log");
});
