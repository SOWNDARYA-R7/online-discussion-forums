const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const Post = require("./models/Post");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ONLINE_FORUM").then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log("Database connection failed", err);
});

// Authentication endpoints
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.json({ message: "Email already exists" });

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.json({ message: "Registration Successful", username: newUser.username });
    } catch (err) {
        res.json({ message: "Error during registration" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            res.json({ message: "Login successfull", username: user.username });
        } else {
            res.json({ message: "Invalid email or password" });
        }
    } catch (err) {
        res.json({ message: "Error during login" });
    }
});

// Post endpoints
app.get("/api/posts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ timestamp: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

app.post("/api/posts", async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const newPost = new Post({ title, content, author });
        await newPost.save();
        res.json({ message: "Post created successfully", post: newPost });
    } catch (err) {
        res.status(500).json({ error: "Failed to create post" });
    }
});

app.get("/api/posts/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: "Error fetching post" });
    }
});

app.post("/api/posts/:id/comment", async (req, res) => {
    try {
        const { author, content } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        post.comments.push({ author, content });
        await post.save();
        res.json({ message: "Comment added successfully", post });
    } catch (err) {
        res.status(500).json({ error: "Failed to add comment" });
    }
});

// User endpoints
app.get("/api/user/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ username: user.username, profilePicture: user.profilePicture });
    } catch (err) {
        res.status(500).json({ error: "Error fetching user" });
    }
});

app.put("/api/user/:username/profile-picture", async (req, res) => {
    try {
        const { profilePicture } = req.body;
        const user = await User.findOneAndUpdate(
            { username: req.params.username },
            { profilePicture },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ message: "Profile picture updated", profilePicture: user.profilePicture });
    } catch (err) {
        res.status(500).json({ error: "Error updating profile picture" });
    }
});

app.listen(3000, () => {
    console.log("Server running in port 3000");
});