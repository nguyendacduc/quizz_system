const express = require('express');
const router = express.Router();
const questionApiController = require('../controllers/questionApiController');
const { requireApiLogin, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(requireApiLogin, authorizeRoles('ADMIN', 'TEACHER'));

router.get('/filters', questionApiController.getFilters);

router.get('/', questionApiController.list);
router.post('/', questionApiController.store);
router.put('/:id', questionApiController.update);
router.delete('/:id', questionApiController.destroy);

module.exports = router;