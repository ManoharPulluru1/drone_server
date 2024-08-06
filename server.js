const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const port = 3000;

const corsOptions = {
  origin: "http://127.0.0.1:5173", // Update this to the specific origin of your client
  credentials: true,
};

app.use(cors(corsOptions)); // Use specific CORS options
app.use(express.json()); // Middleware to parse JSON bodies

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://127.0.0.1:5173", // Update this to the specific origin of your client
    methods: ["GET", "POST"],
    credentials: true,
  },
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("user_connected", (data) => {
    console.log(`Drone ID: ${data.name} - ${data.status}`);
  });

  socket.on("user_disconnected", () => {
    console.log("user_disconnected event received");
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });

  socket.on("drone_ready", (data) => {
    console.log(`Drone ID: ${data.drone_id} - ${data.message}`);
  });

  socket.on("drone_data", (data) => {
    console.log("Received drone data:", data);
  });

  socket.on("stop_drone_data", (data) => {
    console.log(`Stop receiving data from Drone ID: ${data.drone_id}`);
  });
});

app.post("/connect", (req, res) => {
  const drones = req.body;
  drones.forEach((drone) => {
    io.emit("connect_to_drone", drone.droneId);
  });
  res.send("connected");
});

app.post("/disconnect", (req, res) => {
  const drones = req.body;
  drones.forEach((drone) => {
    io.emit("disconnect_from_drone", drone.droneId);
  });
  res.send("disconnected");
});
