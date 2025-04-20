//変数宣言等の初期設定

window.onload = async function () {
    const page = getQueryParameter('page');
    if (page === null) {
        $('.Main').show();
        $("#Welcome").css("display", "block");
        return;
    }
    $('.sidebar-button').removeClass('clicked');
    if (page === "2") {
        $("#friendButton").addClass('clicked');
        disableTransitionTemporarily($("#contentContainer"), "transform 0.4s");
        $('#contentContainer').css('transform', 'translateY(-50%)');
    }
    else if (page === "1") {
        $('#contentContainer').css('transform', 'translateY(0%)');
        $("#chatButton").addClass('clicked');
    }
    $('.Main').show();
}


let username;
let userId;
var groupLastUserId;
const token = localStorage.getItem('JWT');
var userIcon = document.getElementById('userIcon');
var popup = document.getElementById('popup');
var popupItems = popup.getElementsByTagName('li');
var friends;
var groups;
var friendList;
const username_id_Map = new Map();
var socket;
let isComposing = false;
