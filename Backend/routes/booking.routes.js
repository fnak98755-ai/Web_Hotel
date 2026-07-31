const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin', 'staff'), bookingController.getAll);
router.get('/report', auth, role('admin', 'staff'), bookingController.getReport);
router.get('/my', auth, bookingController.getMyBookings);
router.get('/:id', auth, role('admin', 'staff'), bookingController.getById);
router.post('/', auth, role('admin', 'staff'), bookingController.create);
router.post('/online', auth, bookingController.createOnline);
router.put('/:id', auth, role('admin', 'staff'), bookingController.update);
router.patch('/:id/cancel', auth, role('admin', 'staff'), bookingController.cancel);
router.post('/:id/services', auth, role('admin', 'staff'), bookingController.addService);
router.delete('/:id/services/:serviceItemId', auth, role('admin', 'staff'), bookingController.removeService);
router.delete('/:id', auth, role('admin'), bookingController.remove);

module.exports = router;
