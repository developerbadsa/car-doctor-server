const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const port = 3000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://rahimbadsa723:7sHVqE9KSs17rNWF@cluster0.htd2adh.mongodb.net/?retryWrites=true&w=majority";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}
);

async function run() {
  try {
    const servicesDB = client.db("services").collection("servicesCollection");
    const bookingDB = client.db("bookings").collection("bookingsCollection");

    app.get("/services", async (req, res) => {
      // try {
      //   const result = await servicesDB.find().toArray();
      //   res.send(result);
      // } catch (error) {
      //   console.error(error);
      //   res.status(500).send("An error occurred while fetching data from the database.");
      // }

      const result = await servicesDB.find().toArray();
      res.send(result);
    });

    app.get("/services/:id", async(req, res) => {
      const id = req.params.id

      const query = {_id: id}

      const specificsService = await servicesDB.findOne(query)
    
      res.send(specificsService)
    })




    app.get('/booking', async(req, res)=>{
      const queryParams = req.query

     try{
      const result = await bookingDB.find(queryParams ).toArray()
      console.log(result)
      //  res.send(result)
     }catch (err){
      console.log("error happened",)
     }


    })
    








    //post requests
    app.post('/booking', async(req, res)=>{
      const bookingObj = req.body

      const result = await bookingDB.insertOne(bookingObj)

      console.log(result)
      res.send(result)
    })



















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
