const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

function generateReceiptNumber() {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `RCP-${y}${m}${d}-${rand}`;
}

function calculateFinalAmount(amount, discount, discountType) {
    if (!discount || discount <= 0) return amount;
    if (discountType === 'percentage') {
        return Math.round((amount - (amount * discount) / 100) * 100) / 100;
    }
    return Math.max(0, Math.round((amount - discount) * 100) / 100);
}

exports.getAll = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({ path: 'booking', populate: { path: 'customer room' } })
            .sort({ createdAt: -1 });
        res.json(payments);
    }
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
    try {
        const doc = await Payment.findById(req.params.id)
            .populate({ path: 'booking', populate: { path: 'customer room' } });
        if (!doc) return res.status(404).json({ error: 'Payment not found' });
        res.json(doc);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const { booking: bookingId, amount, method, discount, discountType, cardLastFour, qrReference, notes } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ error: 'booking and amount are required.' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        const finalAmount = calculateFinalAmount(amount, discount, discountType);
        const receiptNumber = generateReceiptNumber();

        const payment = await Payment.create({
            booking: bookingId,
            amount,
            discount: discount || 0,
            discountType: discountType || 'fixed',
            finalAmount,
            method,
            status: 'completed',
            cardLastFour,
            qrReference,
            receiptNumber,
            notes,
        });

        const populated = await Payment.findById(payment._id)
            .populate({ path: 'booking', populate: { path: 'customer room' } });

        res.status(201).json(populated);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.amount && (updateData.discount !== undefined || updateData.discountType)) {
            updateData.finalAmount = calculateFinalAmount(
                updateData.amount,
                updateData.discount || 0,
                updateData.discountType || 'fixed'
            );
        }
        const doc = await Payment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate({ path: 'booking', populate: { path: 'customer room' } });
        if (!doc) return res.status(404).json({ error: 'Payment not found' });
        res.json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
    try {
        const doc = await Payment.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Payment not found' });
        res.json({ message: 'Payment deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
