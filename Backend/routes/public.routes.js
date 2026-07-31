const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/public.controller');

router.get('/rooms', ctrl.getRooms);
router.get('/rooms/:id', ctrl.getRoomById);
router.post('/register', ctrl.register);
router.get('/hotel', ctrl.getHotel);

module.exports = router;
