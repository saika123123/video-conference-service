const socket = io();


// この行は削除してください
// const currentUserUid = "exampleUid123"; // 実際にはPC Meiから取得する

function createMeeting() {
    const meetingTime = document.getElementById('meetingTime').value;
    const participantUid = document.getElementById('participantUid').value;

    socket.emit('createMeeting', { meetingTime, participantUid });
}

socket.on('meetingCreated', (data) => {
    const meetingInfo = document.getElementById('meetingInfo');
    const participantUid = document.getElementById('participantUid').value;
    meetingInfo.innerHTML = `
        <h3>会議が作成されました</h3>
        <p>会議ID: ${data.meetingId}</p>
        <p>会議URL: ${data.meetingUrl}</p>
        <p>参加者UID: ${participantUid}</p>
    `;

    scheduleMeeting(document.getElementById('meetingTime').value, data.meetingUrl);
});

function scheduleMeeting(meetingTime, meetingUrl) {
    const meetingDate = new Date(meetingTime);
    const now = new Date();
    const timeUntilMeeting = meetingDate - now;

    if (timeUntilMeeting > 0) {
        setTimeout(() => {
            window.open(meetingUrl, '_blank');
        }, timeUntilMeeting);
    }
}