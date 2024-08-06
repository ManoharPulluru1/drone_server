const io = require("socket.io-client");

// Replace with your server's address
// const socket = io("https://drone-server.onrender.com");
const droneId = "Mobius_Drone_2";

const socket = io("http://localhost:3000");

// Variable to track connection status
let isConnectedToDrone = false;

socket.on("connect", () => {
  console.log("Test client connected to server");

  socket.emit("user_connected", droneId, "Is Ready to connect");

  socket.on("user_connected", (droneId) => {
    console.log(`Drone ID: ${droneId} - Drone Connected to service`);
  });

  socket.on("connect_to_drone", (droneId_req) => {
    if (droneId_req === droneId) {
      if (!isConnectedToDrone) {
        isConnectedToDrone = true;
        console.log(`Drone ID: ${droneId} - Connected to drone`);
        socket.emit("connect_to_drone", droneId);
      } else {
        console.log(`Drone ID: ${droneId} - Already connected to drone`);
      }
    }
  });

  socket.on("disconnect_from_drone", (droneId_req) => {
    if (droneId_req === droneId && isConnectedToDrone) {
      isConnectedToDrone = false;
      console.log(`Drone ID: ${droneId} - Disconnected from drone`);
    }
  });

  socket.on("user_disconnected", () => {
    console.log("user_disconnected event received");
  });
});
