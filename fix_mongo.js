const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://dolooumar60_db_user:Dolo700@ikadeen.u303qrn.mongodb.net/ika_deen_dev?retryWrites=true&w=majority&appName=Ikadeen&tls=true";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('ika_deen_dev');
        const utilisateurs = db.collection('utilisateurs');

        // Find users that have a mosqueeId (string) and move it to mosqueeIds (array)
        const docs = await utilisateurs.find({ mosqueeId: { $exists: true } }).toArray();
        console.log(`Found ${docs.length} users to migrate.`);

        for (const doc of docs) {
            let ids = [];
            if (doc.mosqueeIds && Array.isArray(doc.mosqueeIds)) {
                ids = doc.mosqueeIds;
            }
            if (doc.mosqueeId && typeof doc.mosqueeId === 'string' && doc.mosqueeId.trim() !== '') {
                if (!ids.includes(doc.mosqueeId)) {
                    ids.push(doc.mosqueeId);
                }
            }

            await utilisateurs.updateOne(
                { _id: doc._id },
                { 
                    $set: { mosqueeIds: ids },
                    $unset: { mosqueeId: "" }
                }
            );
            console.log(`Updated user ${doc.email || doc._id} with mosqueeIds:`, ids);
        }

        console.log("Migration complete.");
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
