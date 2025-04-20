//イベントハンドラ

//タイトルアイコン--------------------------------------------
$("#TitleIcon").on('click', function () {
  window.location.href = "https://rickyhome.net";
});

//ユーザーのポップアップ機能--------------------------------------------
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


//サイドバー--------------------------------------------
$('.sidebar-button').on('click', function () {
  $('.sidebar-button').removeClass('clicked');
  $(this).addClass('clicked');

  if (this.id === 'chatButton') {
    $('#contentContainer').css('transform', 'translateY(0)');
  } else if (this.id === 'friendButton') {
    $('#contentContainer').css('transform', 'translateY(-50%)');
  }
});

//チャット機能--------------------------------------------
$('#chat-message').on('keydown', function (event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    if (isComposing) return;
    const message = $('#chat-message').val();
    const Name = $(".friendItem-chat.active span").text();
    const type = $(".friendItem-chat.active").attr('type');
    const Id = $(".friendItem-chat.active").attr('Id');
    if (Name === "") return;
    if (message.trim() !== '') {
      sendMessage(type, Id, message);
    }
    event.preventDefault();
  }
  if (event.key === 'Enter' && event.shiftKey) {
    const cursorPos = this.selectionStart;
    const value = this.value;
    this.value = value.substring(0, cursorPos) + "\n" + value.substring(cursorPos);
    this.selectionStart = cursorPos + 1;
    this.selectionEnd = cursorPos + 1;
    event.preventDefault();
    adjustTextareaHeight();
    this.scrollTop = document.getElementById('chat-content').scrollHeight;

  }
});

$('#chat-message').on('input', function () {
  adjustTextareaHeight();
});
$('#chat-message').on('compositionstart', function () {
  isComposing = true;
});
$('#chat-message').on('compositionend', function () {
  isComposing = false;
});


//フレンド追加機能--------------------------------------------
$('#addFriendForm').on('submit', function (event) {
  event.preventDefault();
  const peerUserName = $("#addFriendText").val();
  $("#addFriendText").val("");
  if (peerUserName === username) {
    const successMessageElement = document.getElementById("addFriendMessage");
    $('#addFriendMessage').removeClass('success');
    $('#addFriendMessage').removeClass('error');
    $('#addFriendMark').removeClass('success');
    $('#addFriendMark').removeClass('error');

    $('#addFriendMessage').addClass('error');
    $('#addFriendMark').text("⚠");
    $('#addFriendMark').addClass('error');
    $('.addFriend-result').text("それはお前じゃ！");
    successMessageElement.style.animation = 'none';
    successMessageElement.offsetHeight;
    successMessageElement.style.animation = "blink 2s";
    return;
  }
  const token = localStorage.getItem('JWT');

  $.ajax({
    url: "php/sendFriendRequest.php",
    type: "POST",
    headers: {
      'Authorization': 'Bearer ' + token
    },
    data: {
      token: token,
      peerName: peerUserName
    },
    success: function (data) {
      const successMessageElement = document.getElementById("addFriendMessage");
      $('#addFriendMessage').removeClass('success');
      $('#addFriendMessage').removeClass('error');
      $('#addFriendMark').removeClass('success');
      $('#addFriendMark').removeClass('error');
      console.log(data.status);
      if (data.status === "error") {
        $('#addFriendMessage').addClass('error');
        $('#addFriendMark').text("⚠");
        $('#addFriendMark').addClass('error');
        $('.addFriend-result').text(data.message);

      }
      else {
        $('#addFriendMark').text("✔");
        $('#addFriendMark').addClass('success');
        $('#addFriendMessage').addClass('success');
        $('.addFriend-result').text("送信に成功しました！")

      }
      successMessageElement.style.animation = 'none';
      successMessageElement.offsetHeight;
      successMessageElement.style.animation = "blink 2s";
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
      console.log(xhr.responseText); // サーバーからのレスポンスをログに出力
    }
  });
});


//グループ作成機能--------------------------------------------
$(".createGroup").on('click', async function () {
  $('.friendItem-chat').removeClass('active');
  $(this).removeClass('active');
  $(this).addClass('active');
  $('.chat-group-container').css('transform', 'translateX(-50%)');
});


$(".createGroup-button").on("click", function () {
  const items = $('.friendItem-forGroupSelection');
  const groupUsersId = [];
  const groupName = $('#groupNameText').val();
  if (items.length > 0) {
    items.each(function () {
      const userName = $(this).find('span').text();
      const groupUserId = getIdByUsername(userName);
      groupUsersId.push(groupUserId);
    });
    console.log(userId);
    console.log(groupName);
    console.log(groupUsersId);

    if (groupName && groupUsersId.length > 0) {
      $.ajax({
        url: "php/createGroup.php",
        type: "POST",
        headers: {
          'Authorization': 'Bearer ' + token
        },
        data: {
          userId: userId,
          groupName: groupName,
          members: groupUsersId
        },
        success: function (data) {
          if (data.status === "success") {
            window.location.href = "?page=1"
          }
          else {
            alert("サーバーでエラーが生じました");
          }
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
          console.log(xhr.responseText);
        }
      });
    } else {
      alert('グループ名とメンバーを選択してください');
    }
  }
  else {
    alert("グループメンバーを選択してください");
  }
})


$(document).on('click', '.friendItem-forGroup', function (event) {
  const selectedName = $(this).find('span').text();
  $('.groupMemberList').append(`
    <li class="friendItem-forGroupSelection">
      <div class="friend-user-iconForgroup">${selectedName.charAt(0).toUpperCase()}</div>
      <span>${selectedName}</span>
    </li>
  `);
  $(this).css("display", "none");
});


$(document).on('click', '.friend-user-iconForgroup', function (event) {
  const selectedName = $(this).siblings('span').text();
  $('.friendList-forGroup').append(`
    <li class="friendItem-forGroup">
        <div class="friend-user-icon chat">${selectedName.charAt(0).toUpperCase()}</div>
        <span>${selectedName}</span>
    </li>
`);
  $(this).parent().remove();
});

$(document).on('mouseenter', '.friend-user-iconForgroup', function () {
  $(this).data('original-text', $(this).text());
  $(this).text('✖');
});

$(document).on('mouseleave', '.friend-user-iconForgroup', function () {
  $(this).text($(this).data('original-text'));
});