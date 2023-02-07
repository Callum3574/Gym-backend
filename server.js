const express = require("express");
const app = express();
const client = require("./database.js");
const port = 4000 || process.env.PORT;
app.use(express.json());
//cors
const cors = require("cors");
app.use(cors(["http://localhost:3000"]));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/input_exercise", async (req, res) => {
  try {
    const data = await req.body;
    const query = {
      text: "INSERT INTO workout VALUES ($1, $2, $3, $4)",
      values: [data.type, data.distance, data.steps, data.calories],
    };
    client.query(query);
    console.log(data);

    res.status(200).send({ message: "successful input!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server error!" });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
