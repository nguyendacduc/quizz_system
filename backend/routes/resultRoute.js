const express = require('express');
const router = express.Router();
const resultApiController = require('../controllers/resultApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/student/history', requireApiLogin, authorizeRoles('STUDENT'), resultApiController.myHistory);

router.get('/teacher/rooms/:room_id/scoreboard', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), resultApiController.roomScoreboard);

module.exports = router;