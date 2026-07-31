const Customer = require('../models/Customer');

exports.getAll = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
    try {
        const doc = await Customer.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Customer not found' });
        res.json(doc);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required.' });
        }
        const exists = await Customer.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: 'Email already registered.' });
        }
        const doc = await Customer.create(req.body);
        res.status(201).json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
    try {
        const { email } = req.body;
        if (email) {
            const dup = await Customer.findOne({ email, _id: { $ne: req.params.id } });
            if (dup) return res.status(400).json({ error: 'Email already taken.' });
        }
        const doc = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ error: 'Customer not found' });
        res.json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
    try {
        const doc = await Customer.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
