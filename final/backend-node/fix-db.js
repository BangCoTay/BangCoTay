const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function fixDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/better-self';
  console.log('Connecting to', uri);
  
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('Dropping indexes...');
    try { 
      await collection.dropIndex('stripe_customer_id_1'); 
      console.log('Dropped stripe_customer_id_1');
    } catch (e) { 
      console.log('Index stripe_customer_id_1 not found'); 
    }
    
    try { 
      await collection.dropIndex('clerk_id_1'); 
      console.log('Dropped clerk_id_1');
    } catch (e) { 
      console.log('Index clerk_id_1 not found'); 
    }

    console.log('Unsetting null values...');
    await collection.updateMany({ stripe_customer_id: null }, { $unset: { stripe_customer_id: "" } });
    await collection.updateMany({ clerk_id: null }, { $unset: { clerk_id: "" } });

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Fix failed:', err);
    process.exit(1);
  }
}

fixDatabase();
