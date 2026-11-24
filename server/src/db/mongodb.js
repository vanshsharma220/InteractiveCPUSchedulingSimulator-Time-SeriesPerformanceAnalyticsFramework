
import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectMongo(env) {
    if (!env.MONGODB_URI) {
        return {
            ok: false,
            error: 'MONGODB_URI is empty'
        };
    }

    try {
        client = new MongoClient(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 2500
        });

        await client.connect();

        db = client.db(
            env.MONGODB_DATABASE || 'algovis_db'
        );

        await db
            .collection('lab_students')
            .createIndex({ department: 1 });

        console.log('MongoDB connected.');

        return { ok: true };

    } catch (e) {
        client = null;
        db = null;

        console.warn(`MongoDB unavailable: ${e.message}`);

        return {
            ok: false,
            error: e.message
        };
    }
}

export function mongoDb() {
    return db;
}

export async function closeMongo() {
    await client?.close();
}
