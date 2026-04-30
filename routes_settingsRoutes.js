const express = require('express');
const settingsController = require('../controllers/settingsController');
const { verifyToken, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', verifyToken, authorize('manager', 'barista'), settingsController.getSettings);
router.put('/', verifyToken, authorize('manager'), settingsController.updateSettings);

module.exports = router;