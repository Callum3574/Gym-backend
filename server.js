const express = require("express");
const app = express();
const client = require("./database.js");

const port = 4000 || process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/input_exercise", (req, res) => {
  const text = "INSERT INTO table_name VALUES ($1, $2, $3, $4, $5)";
  const values = [
    req.body.type,
    req.body.distance,
    req.body.steps,
    req.body.calories,
    req.body.time,
  ];
  console.log(values);

  client.query(text, values, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log(result.rows);
  });

  console.log(res.message);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
