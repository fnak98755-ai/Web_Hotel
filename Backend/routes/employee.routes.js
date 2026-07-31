const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employee.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin', 'staff'), ctrl.getAll);
router.get('/:id', auth, role('admin', 'staff'), ctrl.getById);
router.post('/', auth, role('admin', 'staff'), ctrl.create);
router.put('/:id', auth, role('admin', 'staff'), ctrl.update);
router.patch('/:id/status', auth, role('admin', 'staff'), ctrl.toggleStatus);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
