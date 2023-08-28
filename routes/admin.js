// Admin Routes
const express = require("express");
const router = express.Router();
const registrationController = require("../controler/authaccount");
const adminController = require("../controllers/admin");

router.get("/", adminController.dashboard);

router.get("/employees", adminController.employees);

router.get("/attendance/:user_id", adminController.attendance);

router.post("/add", adminController.add);

router.get("/delete/:employee_id", adminController.delete);

router.get("/deleteRequest/:id", adminController.deleteRequest);

router.get("/deleteAttendance/:attendance_id/:id", adminController.deleteAttendance);

router.post("/update", adminController.update);

router.post("/updateAttendance", adminController.updateAttendance);

router.get("/reports", adminController.reports);

router.get("/leaves", adminController.leaves);

router.get("/absents", adminController.absents);

router.get("/others", adminController.others);



module.exports = router;
