const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customer.controller');
const auth = require('../middleware/auth');
const perm = require('../middleware/perm');

router.get('/', auth, perm('customers'), ctrl.getAll);
router.get('/:id', auth, perm('customers'), ctrl.getById);
router.post('/', auth, perm('customers:create'), ctrl.create);
router.put('/:id', auth, perm('customers:update'), ctrl.update);
router.delete('/:id', auth, perm('customers:delete'), ctrl.remove);

module.exports = router;
