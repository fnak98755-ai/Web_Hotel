const Service = require('../models/Service');

exports.getAll = async (req, res) => {
    try {
        const docs = await Service.find().sort({ name: 1 });
        res.json(docs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
    try {
        const doc = await Service.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Service not found' });
        res.json(doc);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const { name, price } = req.body;
        if (!name || price == null) {
            return res.status(400).json({ error: 'Name and price are required.' });
        }
        if (price <= 0) {
            return res.status(400).json({ error: 'Price must be greater than 0.' });
        }
        const doc = await Service.create(req.body);
        res.status(201).json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
    try {
        const { price } = req.body;
        if (price != null && price <= 0) {
            return res.status(400).json({ error: 'Price must be greater than 0.' });
        }
        const doc = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ error: 'Service not found' });
        res.json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
    try {
        const doc = await Service.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Service not found' });
        res.json({ message: 'Service deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
