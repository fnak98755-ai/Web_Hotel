require('./dnsfix');
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Service = require('./models/Service');
require('dotenv').config();

const seedRooms = [
    { roomNumber: '101', type: 'single', pricePerNight: 50, capacity: 1, description: 'Cozy single room with a comfortable bed and workspace.', amenities: ['WiFi', 'Air Conditioning', 'Desk'], isAvailable: true },
    { roomNumber: '102', type: 'single', pricePerNight: 55, capacity: 1, description: 'Single room overlooking the garden.', amenities: ['WiFi', 'Air Conditioning', 'Balcony'], isAvailable: true },
    { roomNumber: '201', type: 'double', pricePerNight: 80, capacity: 2, description: 'Spacious double room with a queen bed.', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar'], isAvailable: true },
    { roomNumber: '202', type: 'double', pricePerNight: 85, capacity: 2, description: 'Double room with city view.', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Coffee Maker'], isAvailable: true },
    { roomNumber: '301', type: 'suite', pricePerNight: 150, capacity: 3, description: 'Luxury suite with separate living area.', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Jacuzzi'], isAvailable: true },
    { roomNumber: '302', type: 'suite', pricePerNight: 160, capacity: 3, description: 'Executive suite with panoramic view.', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Balcony'], isAvailable: true },
    { roomNumber: '401', type: 'deluxe', pricePerNight: 200, capacity: 4, description: 'Deluxe room with premium furnishings and amenities.', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Smart Room Controls'], isAvailable: true },
    { roomNumber: '402', type: 'deluxe', pricePerNight: 210, capacity: 4, description: 'Presidential deluxe room with lounge access.', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Jacuzzi', 'Lounge Access'], isAvailable: true },
];

const seedServices = [
    { name: 'Breakfast Buffet', description: 'Daily international breakfast buffet.', price: 15, category: 'food' },
    { name: 'Room Service', description: 'In-room dining available 24/7.', price: 20, category: 'food' },
    { name: 'Airport Transfer', description: 'Pickup and drop-off to/from airport.', price: 40, category: 'transport' },
    { name: 'City Tour', description: 'Guided half-day city tour.', price: 35, category: 'transport' },
    { name: 'Spa Massage', description: 'Relaxing 60-minute full body massage.', price: 45, category: 'spa' },
    { name: 'Laundry Service', description: 'Same-day laundry and dry cleaning.', price: 12, category: 'laundry' },
];

async function ensureMany(Model, items, key) {
    let created = 0;
    for (const item of items) {
        const exists = await Model.findOne({ [key]: item[key] });
        if (!exists) {
            await Model.create(item);
            created++;
        }
    }
    return created;
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB');

    const roomsCreated = await ensureMany(Room, seedRooms, 'roomNumber');
    const servicesCreated = await ensureMany(Service, seedServices, 'name');

    const roomCount = await Room.countDocuments();
    const serviceCount = await Service.countDocuments();

    console.log(`Added rooms: ${roomsCreated} (total ${roomCount})`);
    console.log(`Added services: ${servicesCreated} (total ${serviceCount})`);

    await mongoose.disconnect();
    console.log('Seed complete.');
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});