const io = require('socket.io-client');

// Replace with the address of your server if different
const socket = io('http://localhost:3000');

// Event listener for connection
socket.on('connect', () => {
  console.log('Test client connected to server');

  // Emit test events
  socket.emit('user_connected');
//   socket.emit('user_disconnected');

  // Optionally, disconnect after testing
//   setTimeout(() => {
//     // socket.disconnect();
//     console.log('Test client disconnected from server');
//   }, 1000);
});
