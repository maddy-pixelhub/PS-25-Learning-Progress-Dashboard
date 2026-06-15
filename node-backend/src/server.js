require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB || "learning_progress";

let db;

async function connectMongo() {
    const client = new MongoClient(MONGO_URI);

    await client.connect();

    db = client.db(DB_NAME);

    console.log("MongoDB Connected Successfully");
}

app.get("/health", (req, res) => {
    res.json({
        status: "UP",
        database: DB_NAME,
        mongoConnected: !!db
    });
});

app.post("/api/learning-logs", async (req, res) => {
    try {
        const log = {
            ...req.body,
            createdAt: new Date()
        };

        const result = await db
            .collection("learning_logs")
            .insertOne(log);

        res.status(201).json({
            id: result.insertedId,
            ...log
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

app.get("/api/learning-logs", async (req, res) => {
    try {
        const logs = await db
            .collection("learning_logs")
            .find()
            .toArray();

        res.json(logs);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

connectMongo()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(err);
    });