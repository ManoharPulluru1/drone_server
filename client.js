const io = require("socket.io-client");

const droneId = "Mobius_Drone_1";
const socket = io("http://localhost:3000");

// Variable to track connection status
let isConnectedToDrone = false;
// Variable to track if connection request is received
let isConnectRequestReceived = false;

socket.on("connect", () => {
  console.log("Test client connected to server");

  socket.emit("user_connected", droneId, "Is Ready to connect");

  socket.on("user_connected", (droneId) => {
    console.log(`Drone ID: ${droneId} - Drone Connected to service`);
  });

  socket.on("connect_to_drone", (droneId_req) => {
    if (droneId_req === droneId) {
      if (isConnectRequestReceived) {
        if (!isConnectedToDrone) {
          isConnectedToDrone = true;
          console.log(`Drone ID: ${droneId} - Connected to drone`);
          socket.emit("connect_to_drone_message", droneId, "Connected to drone");
        } else {
          console.log(`Drone ID: ${droneId} - Already connected to drone`);
        }
      } else {
        console.log(`Drone ID: ${droneId} - Drone is not connected to power yet`);
      }
    }
  });

  socket.on("disconnect_from_drone", (droneId_req) => {
    if (droneId_req === droneId && isConnectedToDrone) {
      isConnectedToDrone = false;
      console.log(`Drone ID: ${droneId} - Disconnected from drone`);
      socket.emit("disconnect_from_drone_message", droneId, "Disconnected from drone");
    }
  });

  socket.on("user_disconnected", () => {
    console.log("user_disconnected event received");
  });
});

// Listen for the connect request from the server
socket.on("connect_to_drone", (droneId_req) => {
  if (droneId_req === droneId) {
    isConnectRequestReceived = true;
    console.log(`Drone ID: ${droneId} - Connect request received`);
  }
});
