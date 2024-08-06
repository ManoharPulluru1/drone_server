const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const port = 3000;

// Configure CORS to allow requests from specific origins
app.use(cors({
  origin: "*", // Replace "*" with the specific origin(s) you want to allow (e.g., "https://your-frontend-domain.com")
  methods: ["GET", "POST"], // Specify which methods are allowed
  allowedHeaders: ["Content-Type", "Authorization"] // Specify which headers are allowed
}));

app.use(express.json()); /*using middleware*/
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // Replace "*" with the specific origin(s) you want to allow
    methods: ["GET", "POST"]
  }
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
