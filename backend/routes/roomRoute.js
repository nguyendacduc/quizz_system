const express = require('express');
const router = express.Router();
const roomApiController = require('../controllers/roomApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'));

router.get('/', roomApiController.list);
router.post('/', roomApiController.store);
router.put('/:id/status', roomApiController.changeStatus);

router.get('/:id/lobby', roomApiController.viewLobby);
router.put('/:id/students/:student_id', roomApiController.handleStudent);

router.get('/:id/monitor', roomApiController.monitorRoom);

module.exports = router;