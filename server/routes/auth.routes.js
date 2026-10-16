const express = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
router.post('/login', controller.login);
router.post('/logout', authenticate, controller.logout);

module.exports = router;
