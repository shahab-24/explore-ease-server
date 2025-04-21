require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const port = process.env.PORT || 6000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(express.json());
app.use(cookieParser());
app.use(cors())
app.use(morgan('dev'))



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3jtn0.mongodb.net/?appName=Cluster0`;

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
        const touristsCollection = client.db('ExploreEase').collection('tourists')

        app.get('/tourists', async (req, res) => {
                res.send('hello from tourists route')
        })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);


app.get('', (req,res) => {
        res.send('ExploreEase is running.......')
})
app.listen(port, () => {
        console.log(`ExploreEase is running on ${port}`)
})
