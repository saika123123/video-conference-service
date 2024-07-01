const socket = io(window.location.origin);

function createMeeting() {
    const creatorUid = document.getElementById('creatorUid').value;
    const invitedUid = document.getElementById('invitedUid').value;
    const meetingTime = document.getElementById('meetingTime').value;

    if (!creatorUid || !invitedUid || !meetingTime) {
        alert('全ての項目を入力してください。');
        return;
    }

    socket.emit('createMeeting', { creatorUid, invitedUid, meetingTime });
}

function joinMeeting() {
    const invitationCode = document.getElementById('invitationCode').value;
    if (invitationCode) {
        window.location.href = `/join/${invitationCode}`;
    } else {
        alert('招待コードを入力してください。');
    }
}

socket.on('meetingCreated', (data) => {
    const meetingInfo = document.getElementById('meetingInfo');
    const joinUrl = `${window.location.origin}/join/${data.invitationCode}`;
    const meetingUrl = `${window.location.origin}/meetcs27/${data.meetingId}?user=${data.creatorUid}`;
    meetingInfo.innerHTML = `
        <h3>会議が作成されました</h3>
        <p>会議ID: ${data.meetingId}</p>
        <p>招待コード: ${data.invitationCode}</p>
        <p>会議時間: ${data.meetingTime}</p>
        <p>作成者UID: ${data.creatorUid}</p>
        <p>招待者UID: ${data.invitedUid}</p>
        <p>参加URL: <a href="${joinUrl}" target="_blank">${joinUrl}</a></p>
        <p>招待コードを招待者に送信してください。</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}" alt="QR Code">
    `;

    scheduleMeeting(data.meetingTime, meetingUrl);
});

function scheduleMeeting(meetingTime, meetingUrl) {
    const meetingDate = new Date(meetingTime);
    const now = new Date();
    const timeUntilMeeting = meetingDate - now;

    if (timeUntilMeeting > 0) {
        setTimeout(() => {
            window.open(meetingUrl, '_blank');
        }, timeUntilMeeting);
    } else if (timeUntilMeeting > -3600000) { // 1時間以内なら即時接続
        window.open(meetingUrl, '_blank');
    } else {
        alert('この会議の開始時間は過ぎています。');
    }
}