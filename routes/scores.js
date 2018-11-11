const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    var yf = req.app.yf;

    console.log(yf);
});

module.exports = router;
