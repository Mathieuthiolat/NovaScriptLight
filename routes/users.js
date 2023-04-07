const express = require('express');
const router = express.Router();
module.exports = router;

const assetsJS = require("../scriptAssets");

router.get('/getInnerBalance/:user_name',function(req,res){
    var user = req.params.user_name
    assetsJS.getInnerBalance(user).then((innerBalance) => {
        res.send(innerBalance.rows[0]);
    })
});