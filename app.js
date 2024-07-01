const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const meetings = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('createMeeting', (data) => {
    const meetingId = Math.random().toString(36).substring(7);
    const meetingUrl = `https://wsapp.cs.kobe-u.ac.jp/meetcs27/${meetingId}?user=${data.participantUid}`;
    meetings.set(meetingId, {
      time: data.meetingTime,
      participant: data.participantUid,
      url: meetingUrl
    });
    socket.emit('meetingCreated', { meetingId, meetingUrl });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});