const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const rooms = {};

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    socket.on('create-room', (roomId) => {
      socket.join(roomId);
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      console.log(`Room created: ${roomId}`);
    });
  
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      rooms[roomId] = rooms[roomId] || [];
      rooms[roomId].push({ socketId: socket.id, userId });
  
      // console.log(`User ${userId} joined room: ${roomId}`);
      console.log(`user list , ${rooms[roomId]}`);
      io.to(roomId).emit('update-user-list', rooms[roomId]); // Send updated user list to room
    });
  
    socket.on('send-offer', (roomId, offer, targetUserId) => {
        const targetUser = rooms[roomId].find((user) => user.userId === targetUserId);
        if (targetUser) {
          io.to(targetUser.socketId).emit('receive-offer', { 
            offer: { type: offer.type, sdp: offer.sdp }, 
            senderSocketId: socket.id 
          });
        } 
    });

    socket.on('send-answer', (roomId, answer, senderSocketId) => {
        socket.to(senderSocketId).emit('receive-answer', { type: answer.type, sdp: answer.sdp });
      });

    // socket.on('send-offer', (roomId, offer, targetUserId) => { 
    //   const targetUser = rooms[roomId].find(user => user.userId === targetUserId);
    //   if (targetUser) {
    //     io.to(targetUser.socketId).emit('receive-offer', offer);
    //   }
    // });
  
    // socket.on('send-answer', (roomId, answer, targetSocketId) => {
    //   socket.to(targetSocketId).emit('receive-answer', answer);
    // });
  
    socket.on('disconnect', () => {
      // Remove user from room lists
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter(user => user.socketId !== socket.id);
        io.to(roomId).emit('update-user-list', rooms[roomId]);
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });

// io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}`);
  
//     socket.on('create-room', (roomId) => {
//       socket.join(roomId);
//       console.log(`Room created: ${roomId}`);
//     });
  
//     socket.on('join-room', (roomId, userId) => {
//       socket.join(roomId);
//       console.log(`User ${userId} joined room: ${roomId}`);
//       socket.to(roomId).emit('user-joined', userId);
//     });
  
//     socket.on('send-offer', (roomId, offer) => {
//       socket.to(roomId).emit('receive-offer', offer);
//     });
  
//     socket.on('send-answer', (roomId, answer) => {
//       socket.to(roomId).emit('receive-answer', answer);
//     });
  
//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.id}`);
//     });
//   });

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

httpServer.listen(3001, () => {
  console.log('listening on *:3001');
});