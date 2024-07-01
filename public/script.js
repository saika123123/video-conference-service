const socket = io(window.location.origin);

function addParticipantInput() {
    const participantInputs = document.getElementById('participantInputs');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'participantUid';
    newInput.placeholder = '招待する人のUID';
    participantInputs.appendChild(newInput);
}

function createMeeting() {
    const creatorUid = document.getElementById('creatorUid').value;
    const participantInputs = document.getElementsByClassName('participantUid');
    const participants = Array.from(participantInputs).map(input => input.value).filter(uid => uid.trim() !== '');
    const meetingTime = document.getElementById('meetingTime').value;

    if (!creatorUid || participants.length === 0 || !meetingTime) {
        alert('全ての項目を入力してください。');
        return;
    }

    socket.emit('createMeeting', { creatorUid, participants, meetingTime });
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
    let participantsHtml = data.participants.map(p => `
        <p>参加者UID: ${p.uid}</p>
        <p>招待コード: ${p.invitationCode}</p>
        <p>参加URL: <a href="${window.location.origin}/join/${p.invitationCode}" target="_blank">${window.location.origin}/join/${p.invitationCode}</a></p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/join/${p.invitationCode}`)}" alt="QR Code">
    `).join('<hr>');

    meetingInfo.innerHTML = `
        <h3>会議が作成されました</h3>
        <p>会議ID: ${data.meetingId}</p>
        <p>会議時間: ${data.meetingTime}</p>
        <p>作成者UID: ${data.creatorUid}</p>
        <h4>参加者情報:</h4>
        ${participantsHtml}
        <p>各参加者に対応する招待コードを送信してください。</p>
    `;

    const creatorMeetingUrl = `${window.location.origin}/meetcs27/${data.meetingId}?user=${data.creatorUid}`;
    scheduleMeeting(data.meetingTime, creatorMeetingUrl);
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