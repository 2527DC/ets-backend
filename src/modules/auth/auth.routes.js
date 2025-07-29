// src/modules/auth/auth.routes.js
import express from 'express';
import { createSuperAdminController, login } from './auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', createSuperAdminController);

export default router;
