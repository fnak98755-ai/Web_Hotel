const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['single', 'double', 'suite', 'deluxe'], required: true },
    pricePerNight: { type: Number, required: true },
    capacity: { type: Number, required: true },
    description: { type: String },
    amenities: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
