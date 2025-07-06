const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { storage } = require("./cloudinary");
const uploadMiddleware = multer({ storage });
const fs = require("fs");
require("dotenv").config();

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;

// Fix Mongoose deprecation warning
mongoose.set("strictQuery", false);

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://blogit-lilac.vercel.app"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Log the request data
  console.log("Register request received:", {
    username,
    password: password ? "***" : "missing",
  });

  // Check if required fields are present
  if (!username || !password) {
    console.log("Missing required fields");
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Check if username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    console.log("Username already exists:", username);
    return res.status(400).json({ error: "Username already exists" });
  }

  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    console.log("User created successfully:", userDoc.username);
    res.json(userDoc);
  } catch (e) {
    console.log("Registration error:", e.message);
    res.status(400).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  console.log("File uploaded:", req.file);
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    // Cloudinary stores the file URL in req.file.path
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: req.file.path, // This is the Cloudinary URL
      author: info.id,
    });
    res.json(postDoc);
  });
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }
    await postDoc.update({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });
});

app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
