if (!token) {
} else {
    $.ajax({
        url: 'php/verifyToken.php',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function (data) {
            if (data.status === "success") {
                username = data.username;
                userId = data.id;
                Greet(username);
                userIcon.textContent = username.charAt(0).toUpperCase();
                ConnectWebSocket(username, userId);
            } else {
                localStorage.removeItem('JWT');
                window.location.href = "https://rickyhome.net";
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            localStorage.removeItem('JWT');
        }
    });
}

async function Greet(name) {
    $("#Welcome").text("ようこそ, " + name);
    const WelcomeElement = document.getElementById("Welcome");
    WelcomeElement.style.animation = 'none';
    WelcomeElement.offsetHeight;
    WelcomeElement.style.animation = "WelcomeBlink 3s forwards";
    await delay(3000);
    WelcomeElement.style.display = 'none';

}

var popUpIsChanging = false;

userIcon.addEventListener('click', async function () {
    if (popUpIsChanging) return;
    if (popup.classList.contains('show')) {
        popUpIsChanging = true;
        popup.classList.remove('show');
        popup.classList.add('hide');
        popup.addEventListener('transitionend', function () {
            popUpIsChanging = false;
            popup.style.display = 'none';
        }, { once: true });
    } else {
        popUpIsChanging = true;
        popup.style.display = 'block';
        popup.classList.remove('hide');
        await delay(10);
        popup.classList.remove('hide');
        popup.classList.add('show');
        await delay(30);
        popUpIsChanging = false;
    }
});

// 外部クリックでポップアップを閉じる
document.addEventListener('click', function (event) {
    if (popUpIsChanging) return;
    if (!userIcon.contains(event.target) && !popup.contains(event.target)) {
        if (popup.classList.contains('show')) {
            popUpIsChanging = true;
            popup.classList.remove('show');
            popup.classList.add('hide');
            popup.addEventListener('transitionend', function () {
                popup.style.display = 'none';
                popUpIsChanging = false;
            }, { once: true });
        }
    }
});

for (var i = 0; i < popupItems.length; i++) {
    popupItems[i].addEventListener('click', function () {
        switch (this.id) {
            case "logOut":
                localStorage.removeItem('JWT');
                window.location.href = "https://rickyhome.net";
                break;
            case "":
                break;
            case "":
                break;
        }
    });
}