const express = require('express');
const router = express.Router();
const authApiController = require('../controllers/authApiController');

router.post('/register', authApiController.register);
router.post('/login', authApiController.login);
router.post('/logout', authApiController.logout);
router.get('/me', authApiController.me);

module.exports = router;