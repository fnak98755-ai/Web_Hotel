const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
    finalAmount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'card', 'qr'], default: 'cash' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    cardLastFour: { type: String },
    qrReference: { type: String },
    receiptNumber: { type: String },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
