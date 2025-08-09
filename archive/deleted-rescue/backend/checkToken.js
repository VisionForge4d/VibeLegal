const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = process.argv[2];
const secret = process.env.JWT_SECRET || 'dev_secret';

if (!token) {
  console.log('Usage: node checkToken.js <your_token_here>');
  process.exit(1);
}

try {
  const decoded = jwt.decode(token, { complete: true });
  const exp = decoded?.payload?.exp;
  const expDate = new Date(exp * 1000);

  console.log('Token payload:', decoded.payload);
  console.log('Expires at:', expDate.toLocaleString());

  jwt.verify(token, secret);
  console.log('✅ Token is valid.');
} catch (err) {
  console.error('❌', err.message);
}
