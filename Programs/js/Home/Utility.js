//有能達

function getIdByUsername(username) {
  const friend = friends.find(friend => friend.username === username);
  return friend ? friend.id : null;
}

function disableTransitionTemporarily(element, code) {
  element.css("transition", "none");
  // 100ms後にtransitionを再度有効化
  setTimeout(() => {
    element.css("transition", code);
  }, 10);
}

function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

