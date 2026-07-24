const express = require('express');
const router = express.Router();
const activityLogApiController = require('../controllers/activityLogApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');
router.get('/', requireApiLogin, authorizeRoles('ADMIN'), activityLogApiController.listLogs);
module.exports = router;