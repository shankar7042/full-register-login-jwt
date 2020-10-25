const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use("/", express.static(path.join(__dirname, "static")));
app.use(express.json());

mongoose.connect(
  "mongodb://localhost/full-register-login",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("MongoDB connected");
    }
  }
);

app.post("/api/register", (req, res) => {
  console.log(req.body);
  res.json({
    status: "ok",
    data: req.body,
  });
});

app.listen(4000, () => {
  console.log("Server started at http://localhost:4000/");
});
