// src/modules/auth/auth.routes.js
import express from 'express';
import { createSuperAdminController, employeeLogin, login, superAdminLogin,  } from './auth.controller.js';

const router = express.Router();
router.post('/admin/login', superAdminLogin);
router.post('/login', login);
router.post('/register', createSuperAdminController);
router.post('/employe-login', employeeLogin);
export default router;
