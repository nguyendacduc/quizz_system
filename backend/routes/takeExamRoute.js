const express = require('express');
const router = express.Router();
const takeExamApiController = require('../controllers/takeExamApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(requireApiLogin, authorizeRoles('STUDENT'));

router.post('/join', takeExamApiController.joinLobby);
router.get('/:room_id/lobby-info', takeExamApiController.getLobbyInfo);
router.post('/:room_id/leave', takeExamApiController.leaveLobby);
router.post('/:room_id/start', takeExamApiController.startAndFetchExam);
router.post('/:attempt_id/submit', takeExamApiController.submitExam);
router.get('/:attempt_id/check-status', takeExamApiController.checkRoomStatus);

module.exports = router;