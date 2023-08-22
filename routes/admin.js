const express = require("express");
const router = express.Router();
const registrationController = require("../controler/authaccount");

router.get("/employees", registrationController.employees);

router.get("/delete/:employee_id", registrationController.delete);

router.post("/edit", registrationController.edit);

router.get("/dashboard", registrationController.dashboard);

router.get("/reports", registrationController.reports);

router.post("/add", registrationController.add);

module.exports = router;
