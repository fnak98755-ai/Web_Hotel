const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    position: { type: String, required: true },
    department: { type: String },
    salary: { type: Number },
    hireDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
