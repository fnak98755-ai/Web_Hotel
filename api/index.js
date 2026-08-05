require('dotenv').config();

const mongoose = require('mongoose');

const app = require('../Backend/app');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.warn('[MONGO] MONGO_URI is not set in the environment. Set it in Vercel -> Project -> Settings -> Environment Variables.');
}

let connectPromise = null;

function ensureConnected() {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve();
    }
    if (!connectPromise) {
        connectPromise = mongoose
            .connect(MONGO_URI || 'mongodb://localhost:27017/hotel_booking', {
                serverSelectionTimeoutMS: 5000,
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
        res.status(503).json({
            error: 'Database unavailable',
            message: MONGO_URI
                ? err.message
                : 'MONGO_URI is not set. Add it in Vercel -> Project Settings -> Environment Variables, and in MongoDB Atlas allow access from all IPs (0.0.0.0/0).',
        });
        return;
    }
    app(req, res);
}

module.exports = handler;