"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
require("reflect-metadata");
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const app = (0, express_1.default)();
(0, typeorm_1.createConnection)();
//middlewares
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
//routes
app.use(patient_routes_1.default);
app.listen(9001);
console.log('Server on port', 9001);
