const express = require("express");
const path = require("path");

const app = express();
app.use("/", express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(4000, () => {
  console.log("Server started at http://localhost:4000/");
});
