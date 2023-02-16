const express = require("express");
const app = express();
const client = require("./database.js");
const port = 4000 || process.env.PORT;
const auth = require("./auth");

app.use(express.json());
const cors = require("cors");

const admin = require("firebase-admin");

const serviceAccount = require("./gym-auth-development-firebase-adminsdk-lzm2x-8b0366f7a8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.post("/input_exercise", async (req, res) => {
  try {
    const data = await req.body;
    const query = {
      text: "INSERT INTO exercises (workout_id, duration, calories, steps, date, distance) VALUES ($1, $2, $3, $4, $5, $6)",
      values: [
        data.exercise_id,
        data.duration,
        data.calories,
        data.steps,
        data.date,
        data.distance,
      ],
    };
    await client.query(query);
  } catch (error) {
    res.status(500).send({ message: "server error!" });
  }
});

app.get("/all_walk_data/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  console.log(user_id);

  try {
    const data = await client.query(
      "SELECT exercises.id, distance, date, steps, calories, duration, type, location, rating FROM exercises JOIN workouts ON workouts.id = exercises.workout_id JOIN ratings ON ratings.exercise_id = exercises.id WHERE user_id = $1 ORDER BY exercises.id DESC",
      [user_id]
    );
    console.log(data.rows);
    res.status(200).json(data.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server error!" });
  }
});

app.patch("/update_rating", async (req, res) => {
  try {
    const data = await req.body;
    console.log("hey", data);
    const query = {
      text: "UPDATE ratings SET rating = $1 WHERE exercise_id = $2",
      values: [data.rating, data.id],
    };
    await client.query(query);
    await res.status(200).send({ message: "updated rating successfully" });
  } catch (e) {
    json.status(500).send({ message: "could not update rating", e });
  }
});

app.post("/create_user", async (req, res) => {
  try {
    const data = await req.body;

    const query = {
      text: "INSERT INTO users (user_id) VALUES ($1)",
      values: [data.id],
    };
    await client.query(query);

    await admin.auth().setCustomUserClaims(data.id, { role: "admin" });
    res.status(200).send({ message: "user added and claim added" });
  } catch (e) {
    console.error(e);
    res.status(500).send("error posting user id");
  }
});

app.post("/verify_token", async (req, res) => {
  try {
    const { idToken } = req.body;
    console.log(idToken);
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    // Check if user has admin role
    const user = await admin.auth().getUser(uid);
    const customClaims = user.customClaims;
    console.log(customClaims.role);
    if (customClaims && customClaims.role === "admin") {
      res.status(200).send({ message: "Valid token and user is admin" });
    } else {
      res.status(403).send({ message: "User is not authorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
