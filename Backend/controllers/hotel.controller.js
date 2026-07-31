const Hotel = require('../models/Hotel');

exports.get = async (req, res) => {
    try {
        let hotel = await Hotel.findOne();
        if (!hotel) {
            hotel = await Hotel.create({ hotelName: 'My Hotel' });
        }
        res.json(hotel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        let hotel = await Hotel.findOne();
        if (!hotel) {
            hotel = await Hotel.create(req.body);
        } else {
            Object.assign(hotel, req.body);
            await hotel.save();
        }
        res.json(hotel);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
