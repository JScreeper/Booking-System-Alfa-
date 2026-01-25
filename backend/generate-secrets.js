// Helper script to generate secure JWT secrets
const crypto = require('crypto');

console.log('\n🔐 Generating secure JWT secrets...\n');
console.log('Copy these to your .env file:\n');
console.log('JWT_SECRET=' + crypto.randomBytes(64).toString('hex'));
console.log('JWT_REFRESH_SECRET=' + crypto.randomBytes(64).toString('hex'));
console.log('\n✅ Done! These are secure random secrets.\n');
