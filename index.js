const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const port = 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://rahimbadsa723:7sHVqE9KSs17rNWF@cluster0.htd2adh.mongodb.net/?retryWrites=true&w=majority";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const logger = (req, res, next) => {
  // console.log(req.method, req.url)

  next();
};

const verifyCookie = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "UnAuthorize" });
  }

  jwt.verify(token, "rahimbadsa", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "token is not valid" });
    }
    // console.log('decccccc',decoded)
    req.user = decoded;
    next();
  });
};

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

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: id };

      const specificsService = await servicesDB.findOne(query);

      res.send(specificsService);
    });

    //===================================================
    //===================================================
    app.get("/booking", logger, verifyCookie, async (req, res) => {
      const queryParams = req.query;

      try {
        if (queryParams.email === req.user.email) {
          const result = await bookingDB.find(queryParams).toArray();
          res.send(result);
        }
        console.log(queryParams.email);
        console.log(req.user.email);
      } catch (err) {}
    });

    //post requests
    app.post("/booking", async (req, res) => {
      const bookingObj = req.body;

      const result = await bookingDB.insertOne(bookingObj);
      res.send(result);
    });

    //delete from booked list
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await bookingDB.deleteOne(query);
      res.send(result);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, "rahimbadsa", { expiresIn: "1h" });

      res.cookie("token", token, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });

      res.send("server");
    });

    app.post("/logout", (req, res) => {
      if (req.cookies.token) {
        // Clear the 'token' cookie with matching path and domain
        res.clearCookie("token", {
          httpOnly: false, // Make sure this matches how you set the cookie
          secure: true, // Make sure this matches how you set the cookie
          sameSite: "none", // Make sure this matches how you set the cookie
        });
        console.log("Cookie deleted");
        res.send("Logout successful"); // Respond to the client
      } else {
        console.log("No token cookie found.");
        res.send("No token cookie found."); // Respond to the client
      }
    });

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
