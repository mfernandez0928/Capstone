const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./base.js');
const roleEmployeeName = 'employee';
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
exports.isTimeIn = false;

// Employee Dashboard
exports.dashboard = async (req, res) => {
    if(req.cookies.role_name != roleEmployeeName) {
        res.redirect("/login");
    }
    const currentTime = new Date();
    const day = currentTime.getDate();
    const month = currentTime.getMonth();
    const year = currentTime.getFullYear();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const formattedDateTime = `${months[month]} ${day}, ${year} ${hours}:${minutes}`;


    db.query(
        `SELECT * FROM attendance WHERE employee_id = ? 
        AND day = '${day}'
        AND month = '${months[month]}'
        AND year = '${year}'
        AND clock_in IS NOT NULL
        ORDER BY attendance_id DESC`,
        req.cookies.user_id,
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            if(result.length > 0) {
                result = result[0];
                this.isTimeIn = true;
            }

            res.render('employee/dashboard', {title: "Dashboard", formattedDateTime: formattedDateTime, timesheetToday: result})
          }
        }
    )
    
}

// Display Employee Requests
exports.requests = (req, res) => {
    const typeOfRequest = ['Leave','Absent','Others'];
    if(req.cookies.role_name != roleEmployeeName) {
        res.redirect("/login");
    } 
    db.query (
        "SELECT * FROM requests WHERE user_id = ?",
        req.cookies.user_id,
        async(error, result) => {
            result.forEach(function(value, key) {
                result[key]['type_of_request'] = typeOfRequest[value['type_of_request'] - 1];
            });
            res.render('employee/requests/index', {title: "Requests", requests: result, typeOfRequest: typeOfRequest})
        }
    )
}

// Display Request Create Page
exports.create = (req, res) => {
    res.render('employee/requests/create', {title: "Create Request"})
}

// Save Request to DB
exports.store = (req, res) => {
    const { type_of_request, message, subject } = req.body;
    db.query(
        `INSERT INTO requests (user_id, type_of_request, message, subject) 
        VALUES (
            '${req.cookies.user_id}',
            '${type_of_request}',
            '${message}',
            '${subject}'
            )`,
        (err, results) => {
          if (err) {
            console.log(err);
            req.flash('error', 'Something went wrong.');
            
          } else {
            req.flash('success', 'Successfully Updated.');
          }

          res.redirect('/employee/requests')
        }
      ); 
    
}

// Employee clock in
exports.clockIn = (req, res) => {
    const currentDateTime = this.getCurrentDateTime();
    const formattedDate = `${currentDateTime.year}-${currentDateTime.month}-${currentDateTime.day}`;
    const formattedTime = `${currentDateTime.hours}:${currentDateTime.minutes}:${currentDateTime.seconds}`;
    const formattedDateTime = formattedDate + ' ' + formattedTime;

    if(this.isTimeIn) {
        db.query(`UPDATE attendance 
        SET status = 'in'
        WHERE employee_id = '${req.cookies.user_id}' 
            AND day = '${currentDateTime.day}'
            AND month = '${months[currentDateTime.month]}'
            AND year = '${currentDateTime.year}'
        `,
        (err, result) => {
            if(err){
            console.log(err);
            }    
        });
    } else {
        db.query(
            `INSERT INTO attendance (employee_id, day, month, year, shift, time_in, clock_in) 
            VALUES (
                '${req.cookies.user_id}',
                '${currentDateTime.day}',
                '${months[currentDateTime.month]}',
                '${currentDateTime.year}',
                '1',
                '${formattedTime}',
                '${formattedDateTime}'
                )`,
            (err, results) => {
              if (err) {
                console.log(err);
              } 
            }
        ); 
    }

    res.redirect(`/employee`);
}

// Employee clock out
exports.clockOut = (req, res) => {
    const currentDateTime = this.getCurrentDateTime();
    const formattedDate = `${currentDateTime.year}-${currentDateTime.month}-${currentDateTime.day}`;
    const formattedTime = `${currentDateTime.hours}:${currentDateTime.minutes}:${currentDateTime.seconds}`;
    const formattedDateTime = formattedDate + ' ' + formattedTime;

    db.query(`UPDATE attendance SET clock_out = '${formattedDateTime}', 
                    time_out = '${formattedTime}',
                    status = 'out'
    WHERE employee_id = '${req.cookies.user_id}' 
        AND day = '${currentDateTime.day}'
        AND month = '${months[currentDateTime.month]}'
        AND year = '${currentDateTime.year}'
    `,
    (err, result) => {
        if(err){
        console.log(err);
        } else {
        res.redirect(`/employee`);
        }    
    });
}

// Get current time and return as object
exports.getCurrentDateTime = (req, res) => {
    const currentTime = new Date();
    const day = currentTime.getDate();
    const month = currentTime.getMonth();
    const year = currentTime.getFullYear();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();

    return {day: day, month: month, year: year, hours: hours, minutes: minutes, seconds: seconds};
}
