const express = require('express');
const router = express.Router();
const departmentApiController = require('../controllers/departmentApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');
router.get('/', requireApiLogin, departmentApiController.index);
router.post('/', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), departmentApiController.store);
router.put('/:id', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), departmentApiController.update);
router.delete('/:id', requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'), departmentApiController.destroy);
module.exports = router;