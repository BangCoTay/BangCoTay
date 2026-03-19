const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const User = require('./src/models/User');

async function cleanup() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/better-self';
    console.log('Connecting to', uri);
    await mongoose.connect(uri);
    
    console.log('Cleaning up users with null stripe_customer_id or clerk_id...');
    
    // Remote the field entirely if it's null, so sparse index can work
    const result1 = await User.updateMany(
      { stripe_customer_id: null },
      { $unset: { stripe_customer_id: "" } }
    );
    console.log('Updated stripe_customer_id:', result1.modifiedCount, 'documents');

    const result2 = await User.updateMany(
      { clerk_id: null },
      { $unset: { clerk_id: "" } }
    );
    console.log('Updated clerk_id:', result2.modifiedCount, 'documents');

    console.log('Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
