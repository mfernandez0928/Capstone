const express = require('express');
const router = express.Router();
const registerController = require("../controllers/register.js");

router.get('/', (req, res) => {
    res.render('register');
});

router.post('/create', registerController.create);

module.exports = router;