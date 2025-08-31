import express from 'express';
import { departmentsLogs } from './audit.controller.js';

const route = express.Router();


route.get('/departmentsLogs',departmentsLogs )



export default route