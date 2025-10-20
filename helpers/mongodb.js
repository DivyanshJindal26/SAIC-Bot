// handlers/mongodb.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const { MONGODB } = require('../config');

const client = new MongoClient(MONGODB, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

let db;

async function connectMongo() {
    try {
        await client.connect();
        db = client.db('DivBot');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

async function getDb() {
    if (!db) {};
    return db;
}

module.exports = { connectMongo, getDb };
