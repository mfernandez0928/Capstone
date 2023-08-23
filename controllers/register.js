const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./base.js');

exports.create = (req, res) => {
    // console.log(req.body)
    const { first_name, last_name, email, gender, password, confirmPassword } = req.body;

    db.query(
        'SELECT email FROM users WHERE email = ?',
        email ,
        async(error, results) => {
            let hasError = false;
            let errorMessage = '';
            if (error) {
                console.log(error);
            } 
            if (results.length > 0) {
                hasError = true
                errorMessage = 'Email entered is already in use!';
            }
            if (confirmPassword !== password){
                hasError = true
                errorMessage = 'Password is not match';
            }

            if(hasError) {
                req.flash('error', errorMessage);
                res.redirect('/register');
                return;
            }
            const hashPassword = await bcrypt.hash(password,8);

            db.query(
                'INSERT INTO users SET ?',
                { email: email, gender: gender, password: hashPassword },
                (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        req.flash('success', 'You are now registered!');
                        res.redirect('/login')
                        return;
                    }
                }
            )
        }
    )   
}