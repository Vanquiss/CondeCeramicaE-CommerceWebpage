// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
// Endpoint para que el Administrador inicie sesión (RF-1)
router.post('/login', authController.login);

module.exports = router;