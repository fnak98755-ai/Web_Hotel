const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    idType: { type: String, enum: ['passport', 'national_id', 'drivers_license'] },
    idNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
