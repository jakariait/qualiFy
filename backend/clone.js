import { MongoClient } from "mongodb";

const sourceURI = "mongodb+srv://jakariait:Jg0njUydl1srGwDE@jakaria.kd2ej.mongodb.net";
const targetURI = "mongodb://adminUser:G7p!9vR2%40xQ1_sL8@72.61.124.159:27017";

const dbName = "qualiFy";

async function cloneDB() {
  const sourceClient = new MongoClient(sourceURI);
  const targetClient = new MongoClient(targetURI);

  await sourceClient.connect();
  await targetClient.connect();

  const sourceDB = sourceClient.db(dbName);
  const targetDB = targetClient.db(dbName);

  const collections = await sourceDB.listCollections().toArray();

  for (const { name } of collections) {
    console.log(`Cloning ${name}...`);

    const docs = await sourceDB.collection(name).find().toArray();

    if (docs.length > 0) {
      await targetDB.collection(name).deleteMany({});
      await targetDB.collection(name).insertMany(docs);
      console.log(`→ Copied ${docs.length} documents.`);
    } else {
      console.log(`→ Skipped ${name}`);
    }
  }

  console.log("✅ Done");

  await sourceClient.close();
  await targetClient.close();
}

cloneDB();