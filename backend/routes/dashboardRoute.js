const express = require('express');
const router = express.Router();
const dashboardApiController = require('../controllers/dashboardApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'));

router.get('/overview', dashboardApiController.getOverviewStats);

router.get('/statistics', dashboardApiController.getDetailedStats);

router.get('/rooms/:room_id/chart', dashboardApiController.getChartData);

module.exports = router;