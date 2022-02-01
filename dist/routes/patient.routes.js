"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("../controllers/patient.controller");
const router = (0, express_1.Router)();
router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});
// router.Group("/api/patient/", (router) => {
router.get('/', (req, res) => {
    res.send('nodeJs dentalia profile api');
});
router.get('/api/patient/search/:name', patient_controller_1.getPatientName);
router.get('/api/patient/search/id/:patId', patient_controller_1.getPatientId);
router.get('/api/patient/search/receipt/:sesId', patient_controller_1.getReceiptData);
// router.get('/patient/:id', );
// router.post('/patient', );
// router.put('/patient', );
// router.delete('/patient', );
// })
exports.default = router;
