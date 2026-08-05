const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt');
const { PERMISSIONS } = require('../config/permissions');

function sanitizePermissions(body) {
    if (!Array.isArray(body.permissions)) return [];
    return [...new Set(body.permissions.filter(p => PERMISSIONS.includes(p)))];
}

async function syncEmployee(user) {
    if (user.role === 'customer') {
        await Employee.deleteOne({ email: user.email });
        return;
    }
    const exists = await Employee.findOne({ email: user.email });
    if (!exists) {
        await Employee.create({
            name: user.username,
            email: user.email,
            position: user.role === 'admin' ? 'Manager' : 'Staff',
            department: 'Front Office',
            isActive: true,
        });
    }
}

exports.getAll = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const payload = { ...req.body, permissions: sanitizePermissions(req.body) };
        const user = await User.create(payload);
        if (user.role !== 'customer') {
            try {
                await syncEmployee(user);
            } catch (err) {
                await User.findByIdAndDelete(user._id);
                return res.status(400).json({ error: `User created but employee record failed: ${err.message}` });
            }
        }
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const payload = { ...req.body, permissions: sanitizePermissions(req.body) };
        const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        try {
            await syncEmployee(user);
        } catch (err) {
            return res.status(400).json({ error: `User updated but employee sync failed: ${err.message}` });
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await Employee.deleteOne({ email: user.email });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                permissions: user.permissions || []
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
