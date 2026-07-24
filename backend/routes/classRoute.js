const express = require('express');
const router = express.Router();
const classApiController = require('../controllers/classApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');
router.get('/', requireApiLogin, classApiController.index);
router.post('/', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), classApiController.store);
router.put('/:id', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), classApiController.update);
router.delete('/:id', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), classApiController.destroy);
module.exports = router;