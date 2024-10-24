const express = require('express');
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kkyxc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const teaCollection = client.db("teaDB").collection("tea");
        const userCollection = client.db("teaDB").collection("user");

        app.post('/teas', async (req, res) => {
            const newTea = req.body;
            const result = await teaCollection.insertOne(newTea);
            res.send(result);
            console.log(newTea)
        })

        app.get('/teas', async (req, res) => {
            const cursor = teaCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/teas/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await teaCollection.findOne(query);
            res.send(result)
        })

        app.patch('/teas/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedTea = req.body;
            const tea = {
                $set: {
                    name: updatedTea.name,
                    quantity: updatedTea.quantity,
                    supplier: updatedTea.supplier,
                    taste: updatedTea.taste,
                    price: updatedTea.price,
                    details: updatedTea.details,
                    photo: updatedTea.photo,
                },
            };
            const result = await teaCollection.updateOne(filter, tea,options);
            res.send(result);
        })

        app.delete('/teas/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await teaCollection.deleteOne(query);
            res.send(result);
        })

        // userdb
        app.post('/users', async (req, res) => {
            const users = req.body;
            console.log(users);
            const result = await userCollection.insertOne(users);
            res.send(result);
        })
        
        app.get('/users', async (req, res) => {
            const cursor = await userCollection.find().toArray();
            res.send(cursor);          
        })

        app.patch('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: {
                    lastLoggedAt: user.lastLoggedAt
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

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
    res.send('Tea store server!')
})

app.listen(port, () => {
    console.log(`Tea store server on port ${port}`)
})
