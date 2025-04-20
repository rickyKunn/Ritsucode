$.ajax({
    url: 'php/getFriendRequests.php',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    success: function (data) {
        if (data.success) {
            const requests = data.requests;
            requests.forEach(request => {
                $('.friendRequests').append(`
                        <div class="friendRequestItem">
                            <div class="friend-user-icon">${request.requester_username.charAt(0).toUpperCase()}
                            </div>
                            <span>${request.requester_username}</span>
                            <button class="accept-button" onclick="respondToRequest(this,${request.id}, 'accepted')">✓</button>
                            <button class="reject-button" onclick="respondToRequest(this,${request.id}, 'rejected')">✗</button>
                        </div>
                    `);
            });
        } else {
            console.error(data.message);
        }
    },
    error: function (xhr, status, error) {
        console.error('Error:', error);
    }
});



async function respondToRequest(element, requestId, response) {
    const token = localStorage.getItem('JWT');
    console.log(requestId, ":", response);
    $.ajax({
        url: 'php/respondFriendRequest.php',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {
            requestId: requestId,
            response: response
        },
        success: async function (data) {
            const parent = $(element).closest('.friendRequestItem');
            if (response === "accepted") {
                parent.addClass("accept");
            } else {
                parent.addClass("reject");
            }
            await delay(500);
            window.location.href = "?page=2";
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        }
    });
}
