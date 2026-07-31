const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin', 'staff'), roomController.getAll);
router.get('/:id', auth, role('admin', 'staff'), roomController.getById);
router.post('/', auth, role('admin', 'staff'), roomController.create);
router.put('/:id', auth, role('admin', 'staff'), roomController.update);
router.patch('/:id/status', auth, role('admin', 'staff'), roomController.toggleStatus);
router.delete('/:id', auth, role('admin'), roomController.remove);

module.exports = router;
