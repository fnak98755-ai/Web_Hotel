const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user.routes');
const roomRoutes = require('./routes/room.routes');
const bookingRoutes = require('./routes/booking.routes');
const customerRoutes = require('./routes/customer.routes');
const paymentRoutes = require('./routes/payment.routes');
const serviceRoutes = require('./routes/service.routes');
const employeeRoutes = require('./routes/employee.routes');
const hotelRoutes = require('./routes/hotel.routes');
const publicRoutes = require('./routes/public.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Hotel Booking API' });
});

module.exports = app;
