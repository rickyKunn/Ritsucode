function fetchFriends() {
    return $.ajax({
        url: 'php/getFriends.php',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
}

function fetchGroups() {
    return $.ajax({
        url: 'php/getGroups.php',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
}

function UpdateFriendList(friends) {
    const $friendList = $('.friendList');
    const $friendListForGroup = $('.friendList-forGroup');

    if ($friendList.length === 0 || $friendListForGroup.length === 0) {
        console.error('Friend list elements not found in the DOM');
        return;
    }

    friends.forEach(friend => {
        username_id_Map.set(friend.username, friend.id);
        $friendList.append(`
            <li class="friendItem">
                <div class="friend-user-icon chat">${friend.username.charAt(0).toUpperCase()}</div>
                <span>${friend.username}</span>
            </li>
        `);
        $friendListForGroup.append(`
            <li class="friendItem-forGroup">
                <div class="friend-user-icon chat">${friend.username.charAt(0).toUpperCase()}</div>
                <span>${friend.username}</span>
            </li>
        `);
    });

    UpdateFriendChatList(friends);
}

function UpdateGroupChatList(groups) {

    if (friendList.length === 0) {
        console.error('Group list element not found in the DOM');
        return;
    }

    groups.forEach(group => {
        friendList.append(`
            <li class="friendItem-chat" type="group" Id="${group.groupid}">
                <div class="friend-user-icon">${group.groupname.charAt(0).toUpperCase()}</div>
                <span>${group.groupname} (${group.groupmembers.length})</span>
            </li>
        `);
    });

    $('.friendItem-chat').on('click', function () {
        if ($(this).attr('type') === "friend") return;
        $('.friendItem-chat').removeClass('active');
        $('.createGroup').removeClass('active');
        $(this).addClass("active");
        $('.chat-group-container').css('transform', 'translateX(0%)');
        const type = $(".friendItem-chat.active").attr('type');
        const peerId = $(".friendItem-chat.active").attr('Id');
        loadChat(type, peerId);
    });
}

function UpdateFriendChatList(friends) {
    friendList = $('.friend-list');
    friends.forEach(friend => {
        friendList.append(`
            <li class="friendItem-chat" type="friend" Id=${friend.id}>
                <div class="friend-user-icon">${friend.username.charAt(0).toUpperCase()}</div>
                <span>${friend.username}</span>
            </li>
        `);
    });

    $('.friendItem-chat').on('click', function () {
        if ($(this).attr('type') === "group") return;
        $('.friendItem-chat').removeClass('active');
        $('.createGroup').removeClass('active');
        $(this).addClass("active");
        $('.chat-group-container').css('transform', 'translateX(0%)');
        const type = $(".friendItem-chat.active").attr('type');
        const peerId = $(".friendItem-chat.active").attr('Id');
        loadChat(type, peerId);
    });
}

function initializeData() {
    fetchFriends()
        .done(function (data) {
            if (data.status === 'success') {
                friends = data.friends;
                UpdateFriendList(friends);
                fetchGroups()
                    .done(function (data) {

                        if (data.status === 'success') {
                            groups = data.groups;
                            UpdateGroupChatList(groups);
                        } else {
                            console.error(data.message);
                        }
                    })
                    .fail(function (xhr, status, error) {
                        console.error('Error fetching groups:', error);
                    });
            } else {
                console.error(data.message);
            }
        })
        .fail(function (xhr, status, error) {
            console.error('Error fetching friends:', error);
        });
}


initializeData();