const express = require("express");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config();
const cors = require("cors");
const { query } = require("express");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("server is running");
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rdfbo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("tourism-website");
        const services_Collection = database.collection("services");
        const cart_Collection = database.collection("cart");
        app.get("/services", async (req, res) => {
            // console.log("abc");
            const cursor = services_Collection.find({});
            const services = await cursor.toArray();
            res.json(services);
        });
        // const cursor=services_Collection.find({});
        // const services=await cursor.toArray();



        //load card data
        app.get("/cart/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await cart_Collection.find(query).toArray()
            res.json(result);
            // console.log(uid);
        });

        //add data to cart
        app.post("/service/add", async (req, res) => {
            const service = req.body;
            const result = await cart_Collection.insertOne(service);
            console.log(result.insertedId);
            res.json(result);
            // console.log(service);
        });

        //delete data from cart
        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cart_Collection.deleteOne(query);
            res.json(result);
        });


        //purchase delete api
        app.delete("/purchase/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await cart_Collection.deleteMany(query);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(err => console.log(err))
app.listen(port, () => {
    console.log("server is running on port", port);
});