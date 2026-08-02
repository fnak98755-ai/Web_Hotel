const Room = require('../models/Room');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

exports.getRooms = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;
        let rooms = await Room.find().sort({ roomNumber: 1 });

        let bookedIds = [];
        if (checkIn && checkOut) {
            const ci = new Date(checkIn);
            const co = new Date(checkOut);
            const booked = await Booking.find({
                status: { $nin: ['cancelled', 'checked_out'] },
                $or: [
                    { checkIn: { $lt: co }, checkOut: { $gt: ci } }
                ]
            });
            bookedIds = booked.map(b => b.room.toString());
        }

        const result = rooms.map(r => {
            const isBooked = !r.isAvailable || bookedIds.includes(r._id.toString());
            return {
                ...r.toObject(),
                availability: isBooked ? 'booked' : 'available',
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const { checkIn, checkOut } = req.query;

        const query = {
            room: room._id,
            status: { $nin: ['cancelled'] },
        };
        if (checkIn && checkOut) {
            const ci = new Date(checkIn);
            const co = new Date(checkOut);
            query.$or = [
                { checkIn: { $lt: co }, checkOut: { $gt: ci } }
            ];
        }

        const booking = await Booking.findOne(query).sort({ createdAt: -1 });

        let availability = 'available';
        if (!room.isAvailable) {
            availability = 'unavailable';
        } else if (booking) {
            availability = booking.status === 'checked_in' ? 'checked_in'
                : booking.status === 'checked_out' ? 'checked_out'
                : 'booked';
        }

        res.json({
            ...room.toObject(),
            availability,
            currentStatus: booking ? booking.status : null,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required.' });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        const user = await User.create({ username, email, password, role: 'customer' });
        res.status(201).json({ id: user._id, email: user.email, role: user.role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getHotel = async (req, res) => {
    try {
        let hotel = await Hotel.findOne();
        if (!hotel) {
            hotel = await Hotel.create({ hotelName: 'SETEC Hotel' });
        }
        res.json(hotel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
