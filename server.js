const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const port = 3000;

// Create an HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = socketIO(server);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Set up Socket.IO event listeners
io.on('connection', (socket) => {
  console.log('A client connected');

  // Listen for 'user_connected' event
  socket.on('user_connected', () => {
    console.log('user_connected event received');
  });

  // Listen for 'user_disconnected' event
  socket.on('user_disconnected', () => {
    console.log('user_disconnected event received');
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// POST /connect route
app.post('/connect', (req, res) => {
  console.log('Received POST request on /connect');
  io.emit('user_connected'); // Emit 'user_connected' event
  res.send('connected');
});

// POST /disconnect route
app.post('/disconnect', (req, res) => {
  console.log('Received POST request on /disconnect');
  io.emit('user_disconnected'); // Emit 'user_disconnected' event
  res.send('disconnected');
});
