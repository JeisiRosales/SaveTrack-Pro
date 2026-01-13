const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = process.argv[2];
const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

if (!token) {
    console.error('Usage: node check-token.js <your_jwt_token>');
    process.exit(1);
}

if (!secret) {
    console.error('ERROR: No SUPABASE_JWT_SECRET or JWT_SECRET found in .env');
    process.exit(1);
}

console.log('Checking token with secret length:', secret.length);
console.log('Secret starts with:', secret.substring(0, 5) + '...');

try {
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token is VALID!');
    console.log('Payload:', JSON.stringify(decoded, null, 2));
} catch (err) {
    console.error('❌ Token verification FAILED:', err.message);
    if (err.message === 'invalid signature') {
        console.error('POSSIBLE CAUSE: The secret in .env does not match the secret used to sign the token.');
    }
}
