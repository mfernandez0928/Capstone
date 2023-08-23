const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./base.js');
const roleEmployeeName = 'employee';

exports.dashboard = (req, res) => {
    if(req.cookies.role_name != roleEmployeeName) {
        res.redirect("/login");
    } 
    res.render('employee/dashboard', {title: "Dashboard"})
}

exports.requests = (req, res) => {
    if(req.cookies.role_name != roleEmployeeName) {
        res.redirect("/login");
    } 
    db.query (
        "SELECT * FROM requests WHERE user_id = ?",
        req.cookies.user_id,
        async(error, result) => {
            res.render('employee/requests/index', {title: "Requests", requests: result})
        }
    )
}

exports.create = (req, res) => {
    res.render('employee/requests/create', {title: "Create Request"})
}