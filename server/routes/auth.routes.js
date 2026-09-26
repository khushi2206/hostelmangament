const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/change-password', auth, changePassword);

module.exports = router;
