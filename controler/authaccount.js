const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = mysql.createConnection({
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

exports.employees = (req, res) => {
  db.query(
    "SELECT e.employee_id as employee_id ,e.first_name as first_name, e.last_name as last_name, e.email as email, s.time_start as time_start, s.time_end as time_end FROM employee as e INNER JOIN shift as s ON e.shift = s.shift_id;",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("employees.hbs", {
          title: "List of employees",
          users: result,
          employeesCount: result.length,
        });
      }
    }
  );
};

exports.delete = (req, res) => {
  const employee_id = req.params.employee_id;

  console.log(employee_id);
  db.query(
    "DELETE FROM employee WHERE employee_id = ?",
    employee_id,
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        db.query(
          "SELECT e.employee_id as employee_id ,e.first_name as first_name, e.last_name as last_name, e.email as email, s.time_start as time_start, s.time_end as time_end FROM employee as e INNER JOIN shift as s ON e.shift = s.shift_id;",
          (err, result) => {
            // console.log(result);
            res.render("employees.hbs", {
              title: "List of employees",
              users: result,
              employeesCount: result.length,
            });
          }
        );
      }
    }
  );
};

exports.edit = (req, res) => {
  const { employee_id, first_name, last_name, email, shift_id } = req.body;

  // console.log(employee_id, first_name);
  if (first_name == "" && last_name == "") {
    res.render("employees.hbs", {
      message: "First Name and Last Name is required.",
    });
  } else {
    db.query(
      `UPDATE employee AS e INNER JOIN shift AS s ON e.shift = s.shift_id SET e.first_name = "${first_name}", e.last_name = "${last_name}", e.email = "${email}", e.shift = "${shift_id}" WHERE e.employee_id = "${employee_id}"`,
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          db.query(
            "SELECT e.employee_id as employee_id ,e.first_name as first_name, e.last_name as last_name, e.email as email, s.time_start as time_start, s.time_end as time_end FROM employee as e INNER JOIN shift as s ON e.shift = s.shift_id;",
            (err, result) => {
              // console.log(result);
              res.render("employees.hbs", {
                title: "List of employees",
                users: result,
                employeesCount: result.length,
              });
            }
          );
        }
      }
    );
  }
};

exports.dashboard = (req, res) => {
  db.query(
    "SELECT e.employee_id as employee_id ,e.first_name as first_name, e.last_name as last_name, e.email as email, s.time_start as time_start, s.time_end as time_end FROM employee as e INNER JOIN shift as s ON e.shift = s.shift_id;",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("dashboard.hbs", {
          title: "Dashboard",
          users: result,
          employeesCount: result.length,
        });
      }
    }
  );
};

exports.reports = (req, res) => {
  db.query(
    "SELECT e.employee_id as employee_id ,e.first_name as first_name, e.last_name as last_name, e.email as email, s.time_start as time_start, s.time_end as time_end FROM employee as e INNER JOIN shift as s ON e.shift = s.shift_id;",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("reports.hbs", {
          title: "Reports",
          users: result,
          employeesCount: result.length,
        });
      }
    }
  );
};

exports.add = (req, res) => {
  const { first_name, last_name, email, password, cpassword, shift_id } =
    req.body;
  console.log(req.body);
  db.query(
    "SELECT email FROM employee WHERE email = ?",
    email,
    async (err, result) => {
      if (err) {
        consul.log(err);
      }
      if (result.length > 0) {
        return res.render("employees.hbs", {
          error: "Email already in use.",
          danger: "danger",
        });
      } else if (cpassword !== password) {
        return res.render("employees.hbs", {
          error: "Password does not match.",
          danger: "danger",
        });
      }
      const hashPassword = await bcrypt.hash(password, 8);
      console.log(hashPassword);

      db.query(
        `INSERT INTO employee (first_name, last_name, email, password, shift) VALUES ('${first_name}','${last_name}','${email}','${hashPassword}','${shift_id}');`,
        (err, results) => {
          if (err) {
            // console.log(results);
            console.log(err);
          } else {
            db.query(
              "SELECT e.employee_id as employee_id ,e.first_name as first_name, e.last_name as last_name, e.email as email, s.time_start as time_start, s.time_end as time_end FROM employee as e INNER JOIN shift as s ON e.shift = s.shift_id;",
              (err, result) => {
                // console.log(result);
                res.render("employees.hbs", {
                  title: "List of employees",
                  users: result,
                  message: "You have added employee.",
                  success: "success",
                  employeesCount: result.length,
                });
              }
            );
          }
        }
      );
    }
  );
};
