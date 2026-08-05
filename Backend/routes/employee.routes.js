const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employee.controller');
const auth = require('../middleware/auth');
const perm = require('../middleware/perm');

router.get('/', auth, perm('employees'), ctrl.getAll);
router.get('/:id', auth, perm('employees'), ctrl.getById);
router.post('/', auth, perm('employees:create'), ctrl.create);
router.put('/:id', auth, perm('employees:update'), ctrl.update);
router.patch('/:id/status', auth, perm('employees:update'), ctrl.toggleStatus);
router.delete('/:id', auth, perm('employees:delete'), ctrl.remove);

module.exports = router;
