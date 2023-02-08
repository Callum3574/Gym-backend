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
    client.query(query);
    console.log(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server error!" });
  }
});

app.get("/all_walk_data", async (req, res) => {
  try {
    const data = await client.query(
      "SELECT distance, date, steps, calories, duration, type FROM exercises JOIN workouts ON workouts.id = exercises.workout_id ORDER BY workouts.id DESC"
    );
    res.status(200).json(data.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server error!" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
