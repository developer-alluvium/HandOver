import mongoose from 'mongoose';

const IMPORT_MONGODB_URI_PROD = "mongodb+srv://exim:I9y5bcMUHkGHpgq2@exim.xya3qh0.mongodb.net/exim";

async function run() {
  const conn = await mongoose.createConnection(IMPORT_MONGODB_URI_PROD).asPromise();
  const emptyYardColl = conn.collection('empty_yard_directories');
  
  const items = await emptyYardColl.find({}).sort({ name: 1 }).toArray();
  console.log(`Retrieved ${items.length} records from empty_yard_directories:`);
  
  const sample = items.slice(0, 5).map(i => ({
    _id: i._id,
    name: i.name,
    city: i.branches?.[0]?.city || '',
    branchesCount: i.branches?.length || 0,
    pan: i.branches?.[0]?.pan || '',
    tds_percent: i.tds_percent || 0,
    openingBalance: i.openingBalance || 0
  }));

  console.log(JSON.stringify(sample, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
