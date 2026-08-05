const Room = require('../models/Room');
const Booking = require('../models/Booking');

exports.getAll = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;
        const rooms = await Room.find().sort({ roomNumber: 1 });

        const now = new Date();
        const from = checkIn ? new Date(checkIn) : new Date(new Date().setHours(0, 0, 0, 0));
        const to = checkOut ? new Date(checkOut) : new Date(from.getTime() + 24 * 60 * 60 * 1000);

        const rangeBookings = await Booking.find({
            status: { $nin: ['cancelled', 'checked_out'] },
            $or: [
                { checkIn: { $lt: to }, checkOut: { $gt: from } }
            ]
        });

        const futureBookings = await Booking.find({
            room: { $in: rooms.map(r => r._id) },
            status: { $nin: ['cancelled', 'checked_out'] },
            checkOut: { $gt: now },
        }).sort({ checkIn: 1 });

        const rangeByRoom = {};
        for (const b of rangeBookings) {
            const rid = b.room.toString();
            (rangeByRoom[rid] = rangeByRoom[rid] || []).push(b);
        }
        const futureByRoom = {};
        for (const b of futureBookings) {
            const rid = b.room.toString();
            (futureByRoom[rid] = futureByRoom[rid] || []).push(b);
        }

        const result = rooms.map(r => {
            const rid = r._id.toString();
            let currentStatus = 'available';
            if (!r.isAvailable) {
                currentStatus = 'maintenance';
            } else if ((rangeByRoom[rid] || []).length) {
                currentStatus = 'booked';
            }
            return {
                ...r.toObject(),
                currentStatus,
                bookedDates: (futureByRoom[rid] || []).map(b => ({
                    checkIn: b.checkIn,
                    checkOut: b.checkOut,
                    status: b.status,
                })),
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const now = new Date();
        const active = await Booking.findOne({
            room: room._id,
            status: { $nin: ['cancelled', 'checked_out'] },
            checkOut: { $gt: now },
        });

        let currentStatus = 'available';
        if (!room.isAvailable) {
            currentStatus = 'maintenance';
        } else if (active) {
            currentStatus = 'booked';
        }

        res.json({ ...room.toObject(), currentStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { roomNumber, type, pricePerNight, capacity } = req.body;
        if (!roomNumber || !type || !pricePerNight || !capacity) {
            return res.status(400).json({ error: 'roomNumber, type, pricePerNight, and capacity are required.' });
        }
        const exists = await Room.findOne({ roomNumber });
        if (exists) {
            return res.status(400).json({ error: 'Room number already exists.' });
        }
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { roomNumber } = req.body;
        if (roomNumber) {
            const dup = await Room.findOne({ roomNumber, _id: { $ne: req.params.id } });
            if (dup) return res.status(400).json({ error: 'Room number already taken.' });
        }
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });
        room.isAvailable = !room.isAvailable;
        await room.save();
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json({ message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
