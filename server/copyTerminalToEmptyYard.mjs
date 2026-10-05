import mongoose from 'mongoose';

const IMPORT_MONGODB_URI_PROD = "mongodb+srv://exim:I9y5bcMUHkGHpgq2@exim.xya3qh0.mongodb.net/exim";

async function run() {
  console.log("Connecting to MongoDB Atlas exim database...");
  const conn = await mongoose.createConnection(IMPORT_MONGODB_URI_PROD).asPromise();
  console.log("Connected!");

  const cfssimpColl = conn.collection('cfssimp');
  const emptyYardColl = conn.collection('empty_yard_directories');

  const terminals = await cfssimpColl.find({}).toArray();
  console.log(`Found ${terminals.length} documents in cfssimp (Terminal Directory).`);

  if (terminals.length === 0) {
    console.log("No terminal documents found!");
    process.exit(0);
  }

  let insertedCount = 0;
  let updatedCount = 0;

  for (const doc of terminals) {
    const { _id, ...docWithoutId } = doc;
    const res = await emptyYardColl.updateOne(
      { name: doc.name },
      { $setOnInsert: docWithoutId },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      insertedCount++;
    } else {
      updatedCount++;
    }
  }

  const finalCount = await emptyYardColl.countDocuments();
  console.log(`Sync finished! Inserted: ${insertedCount}, Existed: ${updatedCount}, Total in empty_yard_directories: ${finalCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
