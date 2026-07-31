const Employee = require('../models/Employee');

exports.getAll = async (req, res) => {
    try { res.json(await Employee.find()); }
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
    try {
        const doc = await Employee.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Employee not found' });
        res.json(doc);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json(await Employee.create(req.body)); }
    catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
    try {
        const doc = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ error: 'Employee not found' });
        res.json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.toggleStatus = async (req, res) => {
    try {
        const doc = await Employee.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Employee not found' });
        doc.isActive = !doc.isActive;
        await doc.save();
        res.json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
    try {
        const doc = await Employee.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
