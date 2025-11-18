const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const port = 3000;
app.use(cors());
app.use(express.json());

// ps-admin tqcRtn7Ogk22t30U

const uri =
    "mongodb+srv://ps-admin:tqcRtn7Ogk22t30U@cluster0.gtbyi48.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server (moved up and called only once)
        await client.connect();

        const db = client.db("plateShare");
        const modelsCollection = db.collection("foods");
        const requestsCollection = db.collection("requests");

        app.get("/foods", async (req, res) => {
            const result = await modelsCollection.find().toArray();
            res.send(result);
        });

        // app.post("/foods", (req, res) => {
        //   console.log("Received POST:", req.body);
        //   res.json({ message: "Food received", data: req.body });
        // });

        app.post("/foods", async (req, res) => {
            const food = req.body;
            console.log("Received POST:", food);

            const result = await modelsCollection.insertOne(food);

            res.json({
                message: "Food stored successfully",
                insertedId: result.insertedId,
            });
        });

        app.put("/foods/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const updatedFood = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid ID format" });
                }

                const result = await modelsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedFood }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "Food not found" });
                }

                res.json({
                    message: "Food updated successfully",
                    updatedId: id,
                });
            } catch (err) {
                console.error("Error updating food:", err);
                res.status(500).json({ message: "Error updating food" });
            }
        });

        app.delete("/foods/:id", async (req, res) => {
            try {
                const id = req.params.id;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid ID format" });
                }

                const result = await modelsCollection.deleteOne({
                    _id: new ObjectId(id),
                });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: "Food not found" });
                }

                res.json({
                    message: "Food deleted successfully",
                    deletedId: id,
                });
            } catch (error) {
                console.error("Error deleting food:", error);
                res.status(500).json({ message: "Error deleting food" });
            }
        });

        app.get("/requests", async (req, res) => {
            try {
                const result = await requestsCollection.find().toArray();
                res.send(result);
            } catch (err) {
                console.error("Error fetching requests:", err);
                res.status(500).json({ message: "Failed to fetch requests" });
            }
        });

        app.post("/requests", async (req, res) => {
            try {
                const requestData = req.body;

                // Validate required fields
                const requiredFields = [
                    "foodId",
                    "requestedAt",
                    "requesterName",
                    "requesterEmail",
                    "location",
                    "reason",
                    "contact",
                    "status",
                    "foodOwnerEmail",
                ];

                const missing = requiredFields.filter((f) => !requestData[f]);

                if (missing.length > 0) {
                    // Fixed template literal syntax
                    return res
                        .status(400)
                        .json({ message: `Missing fields: ${missing.join(", ")}` });
                }

                // Convert to ObjectId if valid
                if (ObjectId.isValid(requestData.foodId)) {
                    requestData.foodId = new ObjectId(requestData.foodId);
                }

                // Insert request
                const result = await requestsCollection.insertOne(requestData);

                res.json({
                    message: "Request submitted successfully",
                    insertedId: result.insertedId,
                });
            } catch (err) {
                console.error("Error saving request:", err);
                res.status(500).json({ message: "Failed to submit request" });
            }
        });

        app.get("/requests/owner", async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) {
                    return res.status(400).json({ message: "Email is required" });
                }

                const result = await requestsCollection
                    .find({ foodOwnerEmail: email })
                    .toArray();

                res.send(result);
            } catch (err) {
                res.status(500).json({ message: "Failed to fetch requests" });
            }
        });

        app.put("/requests/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const updatedData = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid request ID" });
                }

                const result = await requestsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedData }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "Request not found" });
                }

                res.json({
                    message: "Request updated successfully",
                    updatedId: id,
                });
            } catch (error) {
                console.error("Error updating request:", error);
                res.status(500).json({ message: "Error updating request" });
            }
        });

        app.delete("/requests/:id", async (req, res) => {
            try {
                const id = req.params.id;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid request ID" });
                }

                const result = await requestsCollection.deleteOne({
                    _id: new ObjectId(id),
                });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: "Request not found" });
                }

                res.json({
                    message: "Request deleted successfully",
                    deletedId: id,
                });
            } catch (error) {
                console.error("Error deleting request:", error);
                res.status(500).json({ message: "Error deleting request" });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(port, () => {
    // Fixed template literal syntax
    console.log(`Example app listening on port ${port}`);
});
