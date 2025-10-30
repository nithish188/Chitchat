const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

let users = [];

io.on("connection", (socket) => {
  console.log("User Joined");

  socket.on("join", (username) => {
    if (!users.some((user) => user.id === socket.id)) {
      users.push({ id: socket.id, username });
    }
    io.emit(
      "users",
      users.map((user) => user.username)
    );
    io.emit("message", {
      username: "System",
      message: `${username} has joined the chat.`,
    });
  });

  socket.on("sendMessage", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    const user = users.find((user) => user.id === socket.id);
    if (user) {
      users = users.filter((u) => u.id !== socket.id);
      io.emit(
        "users",
        users.map((user) => user.username)
      );
      io.emit("message", {
        username: "System",
        message: `${user.username} has left the chat.`,
      });
    }
  });
});

// simple health route so visiting the root URL doesn't return a default 404 page
app.get("/", (req, res) => {
  res.status(200).send("Chitchat backend is running\n");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
