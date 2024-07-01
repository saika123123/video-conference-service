const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

const meetings = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('createMeeting', (data) => {
    const meetingId = crypto.randomBytes(4).toString('hex');
    const meeting = {
      id: meetingId,
      time: data.meetingTime,
      creatorUid: data.creatorUid,
      participants: data.participants.map(uid => ({
        uid,
        invitationCode: crypto.randomBytes(6).toString('hex')
      }))
    };
    
    meeting.participants.forEach(participant => {
      meetings.set(participant.invitationCode, meeting);
    });
    
    socket.emit('meetingCreated', { 
      meetingId, 
      meetingTime: data.meetingTime,
      creatorUid: data.creatorUid,
      participants: meeting.participants
    });
  });

  socket.on('joinMeeting', (data) => {
    const meeting = meetings.get(data.invitationCode);
    if (meeting) {
      const participant = meeting.participants.find(p => p.invitationCode === data.invitationCode);
      socket.emit('meetingInfo', {
        meetingId: meeting.id,
        meetingTime: meeting.time,
        creatorUid: meeting.creatorUid,
        participantUid: participant.uid
      });
    } else {
      socket.emit('error', { message: '会議が見つかりません' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get('/join/:invitationCode', (req, res) => {
  const invitationCode = req.params.invitationCode;
  
  const meeting = meetings.get(invitationCode);
  if (meeting) {
    res.sendFile(path.join(__dirname, 'public', 'join.html'));
  } else {
    res.status(404).send('会議が見つかりません');
  }
});

app.get('/meetcs27/:meetingId', (req, res) => {
  const meetingId = req.params.meetingId;
  const user = req.query.user;
  res.redirect(`https://wsapp.cs.kobe-u.ac.jp/meetcs27/${meetingId}?user=${user}`);
});

app.use((req, res, next) => {
  res.status(404).send('ページが見つかりません。');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});