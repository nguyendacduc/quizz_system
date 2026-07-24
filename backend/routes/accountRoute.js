const express = require('express');
const router = express.Router();
const accountApiController = require('../controllers/accountApiController');
const { requireApiLogin } = require('../middlewares/authMiddleware');

router.use(requireApiLogin);

router.get('/profile', accountApiController.getMyProfile);
router.put('/profile', accountApiController.updateMyProfile);
router.put('/change-password', accountApiController.changePassword);

module.exports = router;