import { Router } from 'express';
import { getPatientName, getPatientId } from '../controllers/patient.controller';

const router = Router();

// router.Group("/api/patient/", (router) => {
    router.get('/api/patient/search/:name', getPatientName);
    router.get('/api/patient/search/id/:patId', getPatientId);
    // router.get('/patient/:id', );
    // router.post('/patient', );
    // router.put('/patient', );
    // router.delete('/patient', );
// })

export default router;