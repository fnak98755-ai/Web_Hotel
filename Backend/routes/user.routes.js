const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/login', userController.login);
router.get('/me', auth, userController.me);
router.get('/', auth, role('admin'), userController.getAll);
router.get('/:id', auth, role('admin'), userController.getById);
router.post('/', auth, role('admin'), userController.create);
router.put('/:id', auth, role('admin'), userController.update);
router.delete('/:id', auth, role('admin'), userController.remove);

module.exports = router;
