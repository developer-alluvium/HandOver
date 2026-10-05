import mongoose from 'mongoose';

const IMPORT_MONGODB_URI_PROD = "mongodb+srv://exim:I9y5bcMUHkGHpgq2@exim.xya3qh0.mongodb.net/exim";

async function run() {
  const conn = await mongoose.createConnection(IMPORT_MONGODB_URI_PROD).asPromise();
  const cfssimpColl = conn.collection('cfssimp');
  const emptyYardColl = conn.collection('empty_yard_directories');

  const cfssimpCount = await cfssimpColl.countDocuments();
  const emptyYardCount = await emptyYardColl.countDocuments();

  console.log(`Terminal Directory (cfssimp) document count: ${cfssimpCount}`);
  console.log(`Empty Yard Directory (empty_yard_directories) document count: ${emptyYardCount}`);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
