const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use("/", express.static(path.join(__dirname, "static")));
app.use(express.json());

const JWT_SECRET =
  "zdxfcgfsdtfvhdsvckyuvuycvuyvw!@#$%^&^%$#@!@#$%^cjksgdufyuvds87876513514dusgyucsy";

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

app.post("/api/change-password", async (req, res) => {
  const { oldPassword, newPassword, token } = req.body;

  const user = jwt.verify(token, JWT_SECRET);

  try {
    const userFromDB = await User.findOne({ username: user.user });

    if (!userFromDB) {
      return res.json({ status: "error", error: "Invalid token" });
    }

    const checkPassword = await bcrypt.compare(
      oldPassword,
      userFromDB.password
    );

    if (!checkPassword) {
      return res.json({
        status: "error",
        error: "Old Password is not correct",
      });
    }

    // Validating New Password
    if (!newPassword || typeof newPassword !== "string") {
      return res.json({ status: "error", error: "Invalid Username" });
    } else if (newPassword.length < 6) {
      return res.json({
        status: "error",
        error: "New Password length should be atleast 6 Characters",
      });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    userFromDB.password = newHashedPassword;

    await userFromDB.save();

    return res.json({ status: "ok", data: "Password change succesfully" });
  } catch (error) {
    throw error;
  }
});

app.post("/api/login", async (req, res) => {
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

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ status: "error", error: "Username not exists" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.json({ status: "error", error: "Invalid Username/Password" });
    }

    const token = jwt.sign(
      {
        user: user.username,
      },
      JWT_SECRET
    );

    return res.json({ status: "ok", data: token });
  } catch (error) {
    return res.json({ status: "error", error: error.message });
  }
});

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
