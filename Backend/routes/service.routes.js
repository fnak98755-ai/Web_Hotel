const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/service.controller');
const auth = require('../middleware/auth');
const perm = require('../middleware/perm');

router.get('/', auth, perm('services', 'bookings'), ctrl.getAll);
router.get('/:id', auth, perm('services', 'bookings'), ctrl.getById);
router.post('/', auth, perm('services:create'), ctrl.create);
router.put('/:id', auth, perm('services:update'), ctrl.update);
router.delete('/:id', auth, perm('services:delete'), ctrl.remove);

module.exports = router;
