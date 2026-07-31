const mongoose = require('mongoose');

const bookingServiceSchema = new mongoose.Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
}, { _id: true });

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'], default: 'pending' },
    totalAmount: { type: Number, required: true },
    specialRequests: { type: String },
    services: [bookingServiceSchema],
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
