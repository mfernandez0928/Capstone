const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./base.js');
const roleAdminName = 'admin';
const allEmployeeQueryString = `SELECT e.*, s.*, u.id as user_id, u.first_name, u.last_name, u.email, u.gender
FROM employees e 
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN shift s ON e.shift_id = s.shift_id
WHERE u.role_id = 2
ORDER BY u.first_name ASC`;

exports.list = (req, res) => {
    db.query (
        "SELECT * FROM users WHERE role = 'employee'",
        (error, result) => {
            res.render('admin/employees/index', {title: "Employees", accounts: result})
        }
    )
}
exports.employees = (req, res) => {
    if(req.cookies.role_name != roleAdminName) {
        res.redirect("/login");
    } 
    db.query(
        allEmployeeQueryString,
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
            console.log(result)
          res.render("admin/employees/index", {
            title: "Employee",
            users: result,
            employeesCount: result.length,
          });
        }
      }
    );
};

exports.dashboard = (req, res) => {
    if(req.cookies.role_name != roleAdminName) {
        res.redirect("/login");
    } 
    db.query(
    allEmployeeQueryString,
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("admin/dashboard", {
            title: "Dashboard",
            users: result,
            employeesCount: result.length,
          });
        }
      }
    );
};


exports.add = (req, res) => {

    const { first_name, last_name, email, gender, password, cpassword, shift_id } = req.body;
    db.query(
      "SELECT email FROM users WHERE email = ?",
      email,
      async (err, result) => {
        if (err) {
          console.log(err);
        }

        if (result.length > 0 && email == result[0].email) {
          db.query(
            allEmployeeQueryString,
            (err, result) => {
                req.flash('error', 'Email already in use.');
                res.redirect('/admin/employees');
            }
          );
        } else if (cpassword !== password) {
          db.query(
            allEmployeeQueryString,
            (err, result) => {
                req.flash('error', 'Password does not match.');
                res.redirect('/admin/employees');
            }
          );
        } else {
            const hashPassword = await bcrypt.hash(password, 8);
          db.query(
            `INSERT INTO users (first_name, last_name, email, gender, password, role_id, created_by, updated_by) VALUES ('${first_name}','${last_name}','${email}','${gender}','${hashPassword}', 2, '${req.cookies.user_id}', '${req.cookies.user_id}');`,
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                db.query(
                    `INSERT INTO employees (user_id, shift_id, added_by) VALUES ('${results.insertId}','${shift_id}',${req.cookies.user_id});`,
                    (err, results) => {
                      if (err) {
                        console.log(err);
                      } else {
                        db.query(
                            allEmployeeQueryString,
                              (err, result) => {
                                req.flash('success', 'You have added an employee.');
                                res.redirect('/admin/employees');
                            }
                        );
                    }
                })
              }
            }
          );        
        }
      }
    );
};

exports.update = (req, res) => {
    const { first_name, last_name, email, gender, password, cpassword, shift_id, user_id } = req.body;
    db.query(
      `SELECT email FROM users WHERE email = '${email}' AND id != '${user_id}'`,
      async (err, result) => {
        if (err) {
          console.log(err);
        }

        if (result.length > 0 && email == result[0].email) {
          db.query(
            allEmployeeQueryString,
            (err, result) => {
                req.flash('error', 'Email already in use.');
                res.redirect('/admin/employees');
            }
          );
        } else if (cpassword !== password) {
          db.query(
            allEmployeeQueryString,
            (err, result) => {
                req.flash('error', 'Password does not match.');
                res.redirect('/admin/employees');
            }
          );
        } else {
            const hashPassword = await bcrypt.hash(password, 8);
            db.query(
                `UPDATE users 
                 SET first_name = "${first_name}",
                    last_name = "${last_name}",
                    email = "${email}",
                    gender = "${gender}",
                    password = '${hashPassword}',
                    updated_by = '${req.cookies.user_id}'
                    WHERE id = "${user_id}"`,
                (err, results) => {
                    if (err) {
                        console.log(err);
                    } else {
                        db.query(
                            `UPDATE users SET shift_id = "${shift_id}" WHERE user_id = "${user_id}"`,
                        (err, result) => {
                            req.flash('success', 'Successfully updated.');
                            res.redirect('/admin/employees');
                        });
                    }
                }
            );
        }
    })
};

exports.delete = (req, res) => {
    const employee_id = req.params.employee_id;
  
    db.query(
      "DELETE FROM users WHERE id = ?",
      employee_id,
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          db.query(
            "SELECT e.employee_id as employee_id ,e.first_name as first_name, e.last_name as last_name, e.email as email, s.time_start as time_start, s.time_end as time_end FROM employee as e INNER JOIN shift as s ON e.shift = s.shift_id;",
            (err, result) => {
                req.flash('success', 'Successfully deleted.');
                res.redirect('/admin/employees');
            }
          );
        }
      }
    );
};

exports.reports = (req, res) => {
    db.query(
      "SELECT r.id AS id ,rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request;",
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 1;",
              (err, leave) => {
                db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 2;",
                (err,absent) => {
                  db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 3;",
                  (err,others) => {
                    res.render("admin/reports", {
                      title: "Reports",
                      users: result,
                      totalReports: result.length,
                      totalLeave: leave.length,
                      totalAbsent: absent.length,
                      totalOthers: others.length
                  });
                });
            });
          });
        }
      }
    );
};

exports.leaves = (req, res) => {
  db.query(
    "SELECT r.id AS id ,rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request;",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 1;",
            (err, leave) => {
              db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 2;",
              (err,absent) => {
                db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 3;",
                (err,others) => {
                  res.render("admin/reports", {
                    title: "Reports",
                    users: leave,
                    totalReports: result.length,
                    totalLeave: leave.length,
                    totalAbsent: absent.length,
                    totalOthers: others.length
                });
              });
          });
        });
      }
    }
  );
};

exports.absents = (req, res) => {
  db.query(
    "SELECT r.id AS id ,rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request;",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 1;",
            (err, leave) => {
              db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 2;",
              (err,absent) => {
                db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 3;",
                (err,others) => {
                  res.render("admin/reports", {
                    title: "Reports",
                    users: absent,
                    totalReports: result.length,
                    totalLeave: leave.length,
                    totalAbsent: absent.length,
                    totalOthers: others.length
                });
              });
          });
        });
      }
    }
  );
};

exports.others = (req, res) => {
  db.query(
    "SELECT r.id AS id ,rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request;",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 1;",
            (err, leave) => {
              db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 2;",
              (err,absent) => {
                db.query("SELECT r.id AS id , rt.type AS type, u.email AS email, r.type_of_request AS type_of_request, r.message AS message, r.created_at AS created_at FROM users AS u INNER JOIN requests as r ON u.id = r.user_id INNER JOIN request_type AS rt ON rt.id = r.type_of_request WHERE type_of_request = 3;",
                (err,others) => {
                  res.render("admin/reports", {
                    title: "Reports",
                    users: others,
                    totalReports: result.length,
                    totalLeave: leave.length,
                    totalAbsent: absent.length,
                    totalOthers: others.length
                });
              });
          });
        });
      }
    }
  );
};


exports.deleteRequest = (req, res) => {
  const id = req.params.id;
  console.log(id);
  db.query("DELETE FROM requests WHERE id = ?",
  id,
  (err, result) => {
    if(err){
      console.log(err);
    } else {
      req.flash('success', 'Successfully deleted.');
      res.redirect('/admin/reports');
    }
  })
}