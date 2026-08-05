const secret = process.env.JWT_SECRET;

if (!secret) {
    console.warn('[JWT] JWT_SECRET not set in environment. Using fallback secret (set JWT_SECRET on your hosting provider).');
}

module.exports = secret || 'hotel_booking_jwt_secret_key_2024';
