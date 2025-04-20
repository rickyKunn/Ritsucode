//サーバーとのWebSocket通信

function ConnectWebSocket(_username, _id) {
  try {
    const url = "wss://rickyhome.net/ws";
    socket = new WebSocket(url);
    socket.onopen = function () {
      const data = JSON.stringify({
        username: _username,
        userId: _id,
        type: "connection",
      });
      socket.send(data);
      console.log("サーバーにプレーヤー情報を送信");
    };
  } catch (e) {
    console.log(e);
  }

  // メッセージ受信
  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "DM":
        if ($(".friendItem-chat.active").attr('type') !== "friend") return;
        var activeFriendId = $(".friendItem-chat.active").attr('id');
        var friendId = data.senderId;
        console.log(activeFriendId, friendId);
        if (activeFriendId !== friendId) return;
        $(".nonMessages").remove();
        $('#chat-content').append(`<div class="message received">${data.message}</div>`);
        document.getElementById('chat-content').scrollTop = document.getElementById('chat-content').scrollHeight;
        break;

      case "GM":
        if ($(".friendItem-chat.active").attr('type') !== "group") return;
        var activeGroupId = $(".friendItem-chat.active").attr('id');
        var groupId = data.groupId

        if (activeGroupId !== groupId) return;
        $(".nonMessages").remove();
        var senderId = data.senderId;
        var sendername = data.sendername;
        console.log("groupid:", groupId, "sendername:", sendername);
        const messageClass = senderId === userId ? 'sent' : 'received';
        let userContent = ''
        if (groupLastUserId !== data.senderId && data.senderId !== userId) {
          userContent = `<div class="chat-userContent">
                                <div class="chat-icon">${data.sendername.charAt(0)}</div>
                                <div class="chat-username">${data.sendername}</div>                                          
                          </div>`
        }
        groupLastUserId = data.senderId;
        $('#chat-content').append(`
            ${userContent}
            <div class="message ${messageClass}">
                ${data.message}
            </div>
        `);
        document.getElementById('chat-content').scrollTop = document.getElementById('chat-content').scrollHeight;
        break;

      case "FriendRequest":
        break;
      case "heartbeat":
        console.log("hartbeat受信");
        break;
    }
  };
  socket.onclose = function (event) {
    console.error("ソケット通信が切断されましたよ><");
    location.reload();
  };
  socket.onerror = function (event) {
    console.log(event);
  };
}

function SendWebSocketForDM(_info, _userId, _peerId, kind) {
  const data = JSON.stringify({
    userId: _userId,
    peerId: _peerId,
    info: _info,
    type: "DM",
  });
  socket.send(data);
  console.log("サーバーにチャットを送信");

}

function SendWebSocketForGM(_info, _groupId, _userId, _peerIds, kind) {

  const data = JSON.stringify({
    userId: _userId,
    username: username,
    groupId: _groupId,
    peerIds: _peerIds,
    info: _info,
    type: "GM",
  });
  socket.send(data);
  console.log("サーバーにチャットを送信");

}
