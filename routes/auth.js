const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login for both Admin and Faculty
router.post('/login', authController.login);

router.post('/logout', authController.logout);

module.exports = router;