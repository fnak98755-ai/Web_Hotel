const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payment.controller');
const auth = require('../middleware/auth');
const perm = require('../middleware/perm');

router.get('/', auth, perm('payments'), ctrl.getAll);
router.get('/:id', auth, perm('payments'), ctrl.getById);
router.post('/', auth, perm('payments:create'), ctrl.create);
router.put('/:id', auth, perm('payments:update'), ctrl.update);
router.delete('/:id', auth, perm('payments:delete'), ctrl.remove);

module.exports = router;
