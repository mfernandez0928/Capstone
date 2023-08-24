const express = require('express');
const router = express.Router();
const loginController = require("../controllers/auth.js");

router.post('/auth/login', loginController.authenticate);
router.get('/auth/logout', loginController.logout);

router.get('/login', (req, res) => {
    if(!req.cookies.JWT) {
        res.render('login');
    } else {
        res.redirect("/" + req.cookies.role_name + '/');
    }
    
});

module.exports = router;