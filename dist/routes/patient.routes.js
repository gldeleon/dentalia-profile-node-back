"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("../controllers/patient.controller");
const router = (0, express_1.Router)();
// router.Group("/api/patient/", (router) => {
router.get('/api/patient/search/:name', patient_controller_1.getPatientName);
router.get('/api/patient/search/id/:patId', patient_controller_1.getPatientId);
// router.get('/patient/:id', );
// router.post('/patient', );
// router.put('/patient', );
// router.delete('/patient', );
// })
exports.default = router;
