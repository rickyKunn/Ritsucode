function adjustTextareaHeight() {
    const textarea = $('#chat-message');
    textarea.css('height', 'auto');
    const adjustHeight = textarea.prop('scrollHeight');
    textarea.css('height', adjustHeight + 'px');
    const chatContentHeight = `calc(100% - ${textarea.height() + 40}px)`; // 20pxはpaddingとborderの余裕
    $('#chat-content').css('height', chatContentHeight);
}

function loadChat(_type, _id) {
    $('#chat-content').empty();

    $.ajax({
        url: 'php/getChat.php',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {
            Id: _id,
            type: _type
        },
        success: function (data) {
            if (data.status === 'success') {
                if (data.messages.length === 0) {
                    $('#chat-content').append(`<img class="nonMessages" src="/Image/StartChat.png">`);
                }
                if (_type === "friend") {
                    const messages = data.messages;
                    messages.forEach(message => {
                        const messageClass = message.senderid === userId ? 'sent' : 'received';
                        $('#chat-content').append(`<div class="message ${messageClass}">${message.content}</div>`);
                    });
                }
                else if (_type === "group") {
                    const messages = data.messages;
                    let lastUserId = null;
                    messages.forEach(message => {
                        const messageClass = message.userid === userId ? 'sent' : 'received';
                        let userContent = ''
                        if (lastUserId !== message.userid && message.userid !== userId) {
                            userContent = `<div class="chat-userContent">
                                                <div class="chat-icon">${message.username.charAt(0)}</div>
                                                <div class="chat-username">${message.username}</div>                                          
                                            </div>`


                        }
                        lastUserId = message.userid;
                        $('#chat-content').append(`
                            ${userContent}
                            <div class="message ${messageClass}" userId=${message.userid}>
                                ${message.message}
                            </div>
                        `);
                        groupLastUserId = message.userid;
                    });
                }
                adjustTextareaHeight();
                document.getElementById('chat-content').scrollTop = document.getElementById('chat-content').scrollHeight;
            } else {
                alert(data.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        }
    });
}
//Id:groupの時はgroupId,friendの時はfriendId
function sendMessage(_type, _id, message) {
    console.log(_type, _id, message);
    const formattedText = message.replace(/\n/g, '<br>');
    $.ajax({
        url: 'php/sendMessage.php',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {
            Id: _id,
            message: formattedText,
            type: _type
        },
        success: function (data) {
            if (data.status === 'success') {
                $(".nonMessages").remove();
                $('#chat-content').append(`<div class="message sent">${formattedText}</div>`);
                $('#chat-message').val('');
                switch (_type) {
                    case "friend":
                        SendWebSocketForDM(formattedText, userId, _id, "message");
                        break;
                    case "group":
                        groups.forEach(group => {
                            if (group.groupid !== _id) {
                                return;
                            }
                            SendWebSocketForGM(formattedText, _id, userId, group.groupmembers, "message");
                        });
                        break;
                }
                adjustTextareaHeight();
                document.getElementById('chat-content').scrollTop = document.getElementById('chat-content').scrollHeight;

            } else {
                alert(data.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        }
    });

}