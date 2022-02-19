import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {createConnection} from 'typeorm';
import 'reflect-metadata';

import patientRoutes from './routes/patient.routes';

const app = express();
createConnection();

//middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

//routes
app.use(patientRoutes);

app.listen(9001);
console.log('Server on port', 9001);