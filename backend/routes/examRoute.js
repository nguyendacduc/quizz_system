const express = require('express');
const router = express.Router();
const examApiController = require('../controllers/examApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'));

router.get('/', examApiController.list);
router.post('/', examApiController.store);

router.post('/:id/auto-generate', examApiController.autoGenerate);
router.get('/:id/preview', examApiController.preview);
router.delete('/:id', examApiController.destroy);

module.exports = router;