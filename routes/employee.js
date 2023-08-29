const express = require('express');
const router = express.Router();
const employeeController = require("../controllers/employee.js");

router.get('/', employeeController.dashboard);

router.get('/requests', employeeController.requests);

router.get('/requests/create', employeeController.create);

router.post('/requests/store', employeeController.store);

router.get('/clock-in', employeeController.clockIn);

router.get('/clock-out', employeeController.clockOut);

module.exports = router;