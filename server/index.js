require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./connectDB");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const cloudinary = require('cloudinary').v2;

// Configurations
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());

// Middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Unauthorized: No token provided" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ message: "Unauthorized: Invalid token" });
  }
};

// --- SCHEMAS ---
const threadSchema = new mongoose.Schema({
  title: String,
  text: String,
  imageUrl: String,
  userName: String,
  userId: String,
  topic: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  tags: [String],
  likes: [{ type: String }],
  dislikes: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});
const Thread = mongoose.model("Thread", threadSchema);

const userSchema = new mongoose.Schema({ _id: { type: String, required: true }, email: { type: String, required: true, unique: true }, name: String, createdAt: { type: Date, default: Date.now } });
const User = mongoose.model("User", userSchema);

const topicSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true }, createdAt: { type: Date, default: Date.now } });
const Topic = mongoose.model("Topic", topicSchema);

// --- REST API ---
app.get('/api/upload/signature', authMiddleware, (req, res) => {
    const timestamp = Math.round((new Date).getTime()/1000);
    const signature = cloudinary.utils.api_sign_request({ timestamp: timestamp }, process.env.CLOUDINARY_API_SECRET);
    res.json({ timestamp, signature });
});

app.get("/threads", async (req, res) => {
  const threads = await Thread.find().sort({ createdAt: -1 });
  res.json(threads);
});

app.get("/api/topics", async (req, res) => {
    const topics = await Topic.find().sort({ name: 1 });
    res.json(topics);
});

app.post("/threads", authMiddleware, async (req, res) => {
  try {
    const { title, text, parentId, imageUrl, tags, topic } = req.body;
    const userName = req.user.name || req.user.email;
    const userId = req.user.uid;
    if (!parentId && !topic) return res.status(400).json({ message: "A topic is required." });
    await Topic.findOneAndUpdate({ name: topic }, { $setOnInsert: { name: topic } }, { upsert: true });
    const thread = new Thread({ title, text, parentId, imageUrl, tags, topic, userName, userId });
    await thread.save();
    io.emit("new-thread", thread);
    res.status(201).json(thread);
  } catch (error) {
    res.status(400).json({ message: "Error creating thread", error });
  }
});

const handleVote = async (req, res, voteType) => {
    try {
        const { threadId } = req.params;
        const { uid } = req.user;
        const thread = await Thread.findById(threadId);
        if (!thread) return res.status(404).json({ message: "Thread not found." });
        const oppositeVote = voteType === 'likes' ? 'dislikes' : 'likes';
        thread[oppositeVote].pull(uid);
        const hasVoted = thread[voteType].includes(uid);
        if (hasVoted) {
            thread[voteType].pull(uid);
        } else {
            thread[voteType].push(uid);
        }
        await thread.save();
        io.emit("update-thread", thread);
        res.status(200).json(thread);
    } catch (error) {
        res.status(500).json({ message: `Error ${voteType}ing thread`, error });
    }
};

app.post('/threads/:threadId/like', authMiddleware, (req, res) => handleVote(req, res, 'likes'));
app.post('/threads/:threadId/dislike', authMiddleware, (req, res) => handleVote(req, res, 'dislikes'));

app.post("/api/users/sync", authMiddleware, async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    await User.findOneAndUpdate({ _id: uid }, { email, name }, { upsert: true, new: true });
    res.status(200).json({ message: 'User synced' });
  } catch (error) {
    res.status(500).json({ message: "Error syncing user", error });
  }
});

io.on("connection", (socket) => { console.log("User connected:", socket.id); socket.on("disconnect", () => console.log("User disconnected:", socket.id)); });

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
