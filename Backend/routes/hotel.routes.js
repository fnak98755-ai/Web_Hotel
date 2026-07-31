const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hotel.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin', 'staff'), ctrl.get);
router.put('/', auth, role('admin'), ctrl.update);

module.exports = router;
