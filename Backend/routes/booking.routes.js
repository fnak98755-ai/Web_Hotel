const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth');
const perm = require('../middleware/perm');

router.get('/', auth, perm('bookings', 'payments'), bookingController.getAll);
router.get('/report', auth, perm('reports'), bookingController.getReport);
router.get('/my', auth, bookingController.getMyBookings);
router.get('/:id', auth, perm('bookings'), bookingController.getById);
router.post('/', auth, perm('bookings:create'), bookingController.create);
router.post('/online', auth, bookingController.createOnline);
router.put('/:id', auth, perm('bookings:update'), bookingController.update);
router.patch('/:id/cancel', auth, perm('bookings:update'), bookingController.cancel);
router.post('/:id/services', auth, perm('bookings:update'), bookingController.addService);
router.delete('/:id/services/:serviceItemId', auth, perm('bookings:update'), bookingController.removeService);
router.delete('/:id', auth, perm('bookings:delete'), bookingController.remove);

module.exports = router;
