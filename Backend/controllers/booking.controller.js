const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Service = require('../models/Service');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

exports.getAll = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customer room')
            .populate('services.service')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer room')
            .populate('services.service');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { customer, room, checkIn, checkOut, specialRequests } = req.body;

        if (!customer || !room || !checkIn || !checkOut) {
            return res.status(400).json({ error: 'customer, room, checkIn, and checkOut are required.' });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ error: 'Check-out must be after check-in.' });
        }

        if (checkInDate < new Date().setHours(0, 0, 0, 0)) {
            return res.status(400).json({ error: 'Check-in cannot be in the past.' });
        }

        const roomDoc = await Room.findById(room);
        if (!roomDoc) {
            return res.status(404).json({ error: 'Room not found.' });
        }

        if (!roomDoc.isAvailable) {
            return res.status(400).json({ error: 'Room is not available.' });
        }

        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalAmount = nights * roomDoc.pricePerNight;

        const conflict = await Booking.findOne({
            room,
            status: { $nin: ['cancelled', 'checked_out'] },
            $or: [
                { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ error: 'Room is already booked for the selected dates.' });
        }

        const booking = await Booking.create({
            customer, room, checkIn, checkOut, totalAmount, specialRequests, status: 'confirmed'
        });

        const populated = await Booking.findById(booking._id).populate('customer room').populate('services.service');
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        const populated = await Booking.findById(booking._id).populate('customer room').populate('services.service');
        res.json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.cancel = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking is already cancelled.' });
        }

        if (['checked_out', 'checked_in'].includes(booking.status)) {
            return res.status(400).json({ error: `Cannot cancel a booking with status "${booking.status}".` });
        }

        booking.status = 'cancelled';
        await booking.save();

        const populated = await Booking.findById(booking._id).populate('customer room').populate('services.service');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addService = async (req, res) => {
    try {
        const { serviceId, quantity } = req.body;
        if (!serviceId) {
            return res.status(400).json({ error: 'Service ID is required.' });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found.' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const qty = quantity || 1;
        booking.services.push({
            service: service._id,
            name: service.name,
            price: service.price,
            quantity: qty,
        });

        booking.totalAmount += service.price * qty;
        await booking.save();

        const populated = await Booking.findById(booking._id).populate('customer room').populate('services.service');
        res.json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.removeService = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const item = booking.services.id(req.params.serviceItemId);
        if (!item) {
            return res.status(404).json({ error: 'Service item not found.' });
        }

        booking.totalAmount -= item.price * item.quantity;
        booking.services.pull({ _id: req.params.serviceItemId });
        await booking.save();

        const populated = await Booking.findById(booking._id).populate('customer room').populate('services.service');
        res.json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getReport = async (req, res) => {
    try {
        const { range, from, to } = req.query;
        const fromDate = from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const toDate = to ? new Date(to) : new Date();

        const match = {
            createdAt: { $gte: fromDate, $lte: toDate }
        };

        let groupId;
        if (range === 'weekly') {
            groupId = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
        } else if (range === 'monthly') {
            groupId = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        } else {
            groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        }

        const report = await Booking.aggregate([
            { $match: match },
            {
                $group: {
                    _id: groupId,
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
                    checkedIn: { $sum: { $cond: [{ $eq: ['$status', 'checked_in'] }, 1, 0] } },
                    checkedOut: { $sum: { $cond: [{ $eq: ['$status', 'checked_out'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totals = await Booking.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    avgRevenue: { $avg: '$totalAmount' },
                }
            }
        ]);

        res.json({
            periods: report,
            summary: totals[0] || { totalBookings: 0, totalRevenue: 0, avgRevenue: 0 },
            range: range || 'daily',
            from: fromDate,
            to: toDate,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customer room')
            .populate('services.service')
            .sort({ createdAt: -1 });
        const mine = bookings.filter(b => b.customer && b.customer.email === req.user.email);
        res.json(mine);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createOnline = async (req, res) => {
    try {
        const { room: roomId, checkIn, checkOut, specialRequests } = req.body;

        if (!roomId || !checkIn || !checkOut) {
            return res.status(400).json({ error: 'room, checkIn, and checkOut are required.' });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ error: 'Check-out must be after check-in.' });
        }

        const roomDoc = await Room.findById(roomId);
        if (!roomDoc) {
            return res.status(404).json({ error: 'Room not found.' });
        }

        if (!roomDoc.isAvailable) {
            return res.status(400).json({ error: 'Room is not available.' });
        }

        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalAmount = nights * roomDoc.pricePerNight;

        const conflict = await Booking.findOne({
            room: roomId,
            status: { $nin: ['cancelled', 'checked_out'] },
            $or: [
                { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ error: 'Room is already booked for the selected dates.' });
        }

        let customer = await Customer.findOne({ email: req.user.email });
        if (!customer) {
            customer = await Customer.create({
                name: req.user.email.split('@')[0],
                email: req.user.email,
            });
        }

        const booking = await Booking.create({
            customer: customer._id,
            room: roomId,
            checkIn,
            checkOut,
            totalAmount,
            specialRequests,
            status: 'confirmed',
        });

        const receiptNumber = 'RCP-' + Date.now().toString(36).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

        await Payment.create({
            booking: booking._id,
            amount: totalAmount,
            finalAmount: totalAmount,
            status: 'pending',
            receiptNumber,
        });

        const populated = await Booking.findById(booking._id)
            .populate('customer room')
            .populate('services.service');

        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
