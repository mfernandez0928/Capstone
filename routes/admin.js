const express = require("express");
const router = express.Router();
const registrationController = require("../controler/authaccount");
const adminController = require("../controllers/admin");

router.get("/", adminController.dashboard);

router.get("/employees", adminController.employees);

router.post("/add", adminController.add);

router.get("/delete/:employee_id", adminController.delete);

router.get("/deleteRequest/:id", adminController.deleteRequest);

router.post("/update", adminController.update);

router.get("/reports", adminController.reports);



module.exports = router;
