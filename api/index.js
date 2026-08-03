require('dotenv').config();

const mongoose = require('mongoose');

const app = require('../Backend/app');

let connectPromise = null;

function ensureConnected() {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve();
    }
    if (!connectPromise) {
        connectPromise = mongoose
            .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_booking', {
                serverSelectionTimeoutMS: 10000,
                bufferCommands: true,
            })
            .catch((err) => {
                connectPromise = null;
                throw err;
            });
    }
    return connectPromise;
}

async function handler(req, res) {
    try {
        await ensureConnected();
    } catch (err) {
        res.status(503).json({ error: 'Database unavailable', message: err.message });
        return;
    }
    app(req, res);
}

module.exports = handler;