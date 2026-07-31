const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    hotelName: { type: String, required: true, default: 'My Hotel' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    taxId: { type: String, default: '' },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '12:00' },
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
