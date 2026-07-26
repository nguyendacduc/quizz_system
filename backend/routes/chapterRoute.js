const express = require('express');
const router = express.Router();
const chapterApiController = require('../controllers/chapterApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');
router.get('/subject/:subject_id', requireApiLogin, chapterApiController.getBySubject);
router.post('/', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), chapterApiController.store);
router.put('/:id', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), chapterApiController.update);
router.delete('/:id', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), chapterApiController.destroy);
module.exports = router;