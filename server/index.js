require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./connectDB");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Schema
const mongoose = require("mongoose");
const threadSchema = new mongoose.Schema({
  title: String,
  text: String,
  imageUrl: String,
  // MODIFIED: Added userName to the schema
  userName: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});
const Thread = mongoose.model("Thread", threadSchema);

// REST API
app.get("/threads", async (req, res) => {
  const threads = await Thread.find();
  res.json(threads);
});

app.post("/threads", async (req, res) => {
  try {
    // MODIFIED: Destructure and save the new userName field
    const { title, text, parentId, imageUrl, tags, userName } = req.body;
    const thread = new Thread({
      title,
      text,
      parentId,
      imageUrl,
      tags,
      userName,
    });
    
    await thread.save();
    io.emit("new-thread", thread); // Real-time push
    res.status(201).json(thread);
  } catch (error) {
    res.status(400).json({ message: "Error creating thread", error });
  }
});

// WebSocket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

// Connect DB then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
});