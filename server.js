const express = require("express");
const app = express();
const client = require("./database.js");
const port = 4000 || process.env.PORT;
const auth = require("./auth");
const http = require("http");
const cors = require("cors");
const serviceAccount = require("./gym-auth-development-firebase-adminsdk-lzm2x-34721cf03e.json");
const admin = require("firebase-admin");

const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
io.on("connection", (socket) => {
  console.log(`User is now connected: ID: ${socket.id}`);

  socket.on("message", (data) => {
    console.log(data);
    io.emit("messageResponse", data);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.post("/input_exercise", async (req, res) => {
  try {
    const data = await req.body;
    const query = {
      text: "INSERT INTO exercises (workout_id, duration, calories, steps, date, distance, user_id, location, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      values: [
        data.exercise_id,
        data.duration,
        data.calories,
        data.steps,
        data.date,
        data.distance,
        data.user_id,
        data.location,
        data.rating,
      ],
    };
    await client.query(query);
  } catch (error) {
    res.status(500).send({ message: "server error!" });
  }
});

app.get("/all_walk_data/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const data = await client.query(
      "SELECT exercises.id, distance, date, steps, calories, duration, type, location, rating FROM exercises JOIN workouts ON workouts.id = exercises.workout_id WHERE user_id = $1 ORDER BY exercises.id DESC",
      [user_id]
    );
    res.status(200).send(data.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server error!" });
  }
});

app.patch("/update_rating", async (req, res) => {
  try {
    const data = await req.body;
    const query = {
      text: "UPDATE exercises SET rating = $1 WHERE id = $2",
      values: [data.rating, data.id],
    };
    await client.query(query);
    await res.status(200).send({ message: "updated rating successfully" });
  } catch (e) {
    res.status(500).send({ message: "could not update rating", e });
  }
});

app.post("/create_user", async (req, res) => {
  try {
    const data = await req.body;

    const query = {
      text: "INSERT INTO users (user_id, firstName, lastName) VALUES ($1, $2, $3)",
      values: [data.id, data.firstName, data.lastName],
    };
    await client.query(query);

    await admin.auth().setCustomUserClaims(data.id, { role: "user" });
    res.status(200).send({ message: "user added and claim added" });
  } catch (e) {
    console.error(e);
    res.status(500).send("error posting user id");
  }
});

app.get("/get_user/:user_id", async (req, res) => {
  const data = req.params.user_id;
  console.log(data);
  try {
    const query = {
      text: "SELECT firstname FROM users WHERE user_id = $1",
      values: [data],
    };
    const name = await client.query(query);
    res.status(200).send({ message: "user found!", name: name.rows });
  } catch (e) {
    console.error(e);
  }
});

app.post("/verify_token", async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    // Check if user has admin role
    const user = await admin.auth().getUser(uid);
    const customClaims = user.customClaims;
    if (customClaims && customClaims.role === "admin") {
      res.status(200).send({ auth: true });
    } else {
      res.status(403).send({ auth: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong" });
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
