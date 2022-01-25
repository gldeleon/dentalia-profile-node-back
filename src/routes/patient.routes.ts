import { Router } from 'express';
import { getPatientName, getPatientId } from '../controllers/patient.controller';

const router = Router();

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
    router.get('/api/patient/search/:name', getPatientName);
    router.get('/api/patient/search/id/:patId', getPatientId);
    // router.get('/patient/:id', );
    // router.post('/patient', );
    // router.put('/patient', );
    // router.delete('/patient', );
// })

export default router;