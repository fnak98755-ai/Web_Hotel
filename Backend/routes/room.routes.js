const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const auth = require('../middleware/auth');
const perm = require('../middleware/perm');

router.get('/', auth, perm('rooms'), roomController.getAll);
router.get('/:id', auth, perm('rooms'), roomController.getById);
router.post('/', auth, perm('rooms:create'), roomController.create);
router.put('/:id', auth, perm('rooms:update'), roomController.update);
router.patch('/:id/status', auth, perm('rooms:update'), roomController.toggleStatus);
router.delete('/:id', auth, perm('rooms:delete'), roomController.remove);

module.exports = router;
