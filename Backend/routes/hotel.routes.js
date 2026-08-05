const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hotel.controller');
const auth = require('../middleware/auth');
const perm = require('../middleware/perm');

router.get('/', auth, perm('settings'), ctrl.get);
router.put('/', auth, perm('settings'), ctrl.update);

module.exports = router;
