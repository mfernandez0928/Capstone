const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./base.js');

// Login Function
exports.authenticate = (req, res) => {

    try {
        const {email, password} = req.body;

        if (email === "" || password === "" ) {
            res.render("index", {message: "Email and password should not be empty"} )
        } else {
            db.query (
                "SELECT * FROM users WHERE email = ? LIMIT 1",
                email,
                async(error, result) => {
                    if (!result.length > 0) {
                        req.flash('error', 'The email does not exist!')
                        res.redirect("/login")
                    } 
                    else if (!(await bcrypt.compare(password, result[0].password))) {
                        req.flash('error', 'Password Incorrect!!')
                        res.redirect("/login");
                    }
                    else {
                        const id = result[0].id;
                        const token = jwt.sign({id},process.env.JWTSECRET, {expiresIn: process.env.JWTEXPIRES});
                        const cookieoptions = {
                            expires: new Date(Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000),
                            httpOnly: true, 
                            secure: true, 
                            sameSite: 'Strict'
                        };
                        res.cookie('JWT',token, cookieoptions);
                        res.cookie('user_id',id, cookieoptions);

                        const role = result[0]['role_id'];
                        let roleName = 'admin';
                        
                        if(role == '2') {
                            roleName = 'employee';
                        }

                        res.cookie('role_name',roleName, cookieoptions);
                        res.redirect("/" + roleName + '/');
                    }
                }
            )
        }
    } catch (error) {
        console.log(`Catched error ${error}`);
    }

};

// Logout 
exports.logout = (req,res) => {
    res.clearCookie("user_id").status(200);
    res.clearCookie("JWT").status(200);
    res.clearCookie("role_name").status(200);
    res.redirect('/login');
}