const express = require("express");
const app = express();
const client = require("./database.js");
const port = 4000 || process.env.PORT;
app.use(express.json());
const cors = require("cors");
app.use(cors(["http://localhost:3000"]));

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

app.get("/all_walk_data", async (req, res) => {
  try {
    const data = await client.query(
      "SELECT exercises.id, distance, date, steps, calories, duration, type, location, rating FROM exercises JOIN workouts ON workouts.id = exercises.workout_id JOIN ratings ON ratings.exercise_id = exercises.id ORDER BY exercises.id DESC"
    );
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
