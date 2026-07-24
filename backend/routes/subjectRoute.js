const express = require('express');
const router = express.Router();
const subjectApiController = require('../controllers/subjectApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');
router.get('/', requireApiLogin, subjectApiController.index);
router.post('/', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), subjectApiController.store);
router.put('/:id', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), subjectApiController.update);
router.delete('/:id', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), subjectApiController.destroy);
module.exports = router;