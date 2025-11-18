const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
const port = 3000
app.use(cors())
app.use(express.json())

// ps-admin tqcRtn7Ogk22t30U



const uri = "mongodb+srv://ps-admin:tqcRtn7Ogk22t30U@cluster0.gtbyi48.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db = client.db("plateShare");
        const modelsCollection = db.collection("foods");

        app.get('/foods',  async (req, res) => {
           const result = await modelsCollection.find().toArray();
            res.send(result);
        });


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






        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
