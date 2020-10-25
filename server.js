const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const app = express();
app.use("/", express.static(path.join(__dirname, "static")));
app.use(express.json());

mongoose.connect(
  "mongodb://localhost/full-register-login",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("MongoDB connected");
    }
  }
);

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  // Validating Username
  if (!username || typeof username !== "string" || username.trim() === "") {
    return res.json({ status: "error", error: "Invalid Username" });
  }

  // Validating Password
  if (!password || typeof password !== "string") {
    return res.json({ status: "error", error: "Invalid Username" });
  } else if (password.length < 6) {
    return res.json({
      status: "error",
      error: "Password length should be atleast 6 Characters",
    });
  }

  // Hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ username, password: hashedPassword });
    await user.save();
    return res.json({ status: "ok", data: "User created" });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ status: "error", error: "Username already exists" });
    }
    throw error;
  }
});

app.listen(4000, () => {
  console.log("Server started at http://localhost:4000/");
});
