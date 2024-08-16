const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

let isDroneConnected = false;
const upload = multer({ dest: "uploads/" });

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("start_message", ({ data, id }) => {
    console.log(id, "drone", data);
  });

  socket.on("connect_to_drone", ({ id, status, state }) => {
    console.log(state);
    if (state) {
      isDroneConnected = true;
    }
    console.log(`Drone ${id} connected with status: ${status}`);
  });

  socket.on("disconnect_to_drone", ({ id, status, state }) => {
    console.log(state);
    if (!state) {
      isDroneConnected = false;
    }
    console.log(`Drone ${id} disconnected with status: ${status}`);
  });

  socket.on("yaw_data", ({ id, yaw }) => {
    console.log(`Received yaw data from drone ${id}: ${yaw}`);
  });

  socket.on("position_data", ({ id, latitude, longitude }) => {
    console.log(`Received position data from drone ${id}: Latitude: ${latitude}, Longitude: ${longitude}`);
  });

  socket.on("warning", ({ id, message }) => {
    console.log(`Warning from drone ${id}: ${message}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // New event listeners for land and stable modes
  socket.on("land", () => {
    io.sockets.emit("land_command");
    console.log("Land command sent to drone");
  });

  socket.on("stable", () => {
    io.sockets.emit("stable_command");
    console.log("Stable command sent to drone");
  });
});

app.post("/connect", (req, res) => {
  const { id } = req.body;
  if (isDroneConnected) {
    console.log(`Drone ${id} is already connected`);
    return res.status(400).send(`Drone ${id} is already connected`);
  }
  io.sockets.emit("connect_pixhawk", { id });
  res.sendStatus(200);
});

app.post("/disconnect", (req, res) => {
  const { id } = req.body;
  if (!isDroneConnected) {
    console.log(`Drone ${id} is not connected`);
    return res.status(400).send(`Drone ${id} is not connected`);
  }
  io.sockets.emit("disconnect_pixhawk", { id });
  res.sendStatus(200);
});

app.get("/actionArm", (req, res) => {
  io.sockets.emit("action_arm");
  res.sendStatus(200);
});

app.get("/actionDisarm", (req, res) => {
  io.sockets.emit("action_disarm");
  res.sendStatus(200);
});

app.post("/thrust", (req, res) => {
  const { thrust } = req.body;
  io.sockets.emit("set_thrust", { thrust });
  res.sendStatus(200);
});

app.get("/",(req,res)=>{
  res.send("Working Server")
})

app.get("/land", (req, res) => {
  io.sockets.emit("land");
  res.sendStatus(200);
});

app.get("/stable", (req, res) => {
  io.sockets.emit("stable");
  res.sendStatus(200);
});

app.post("/postmission", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const missionFilePath = path.resolve(req.file.path);

  try {
    const missionData = fs.readFileSync(missionFilePath, "utf8");

    // Emit the mission data to the connected clients
    io.sockets.emit("load_mission", { missionData });

    console.log("Mission data sent to client");
    res.status(200).send("Mission data sent successfully");
  } catch (err) {
    console.error("Error reading mission file:", err);
    res.status(500).send("Failed to read mission file");
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});