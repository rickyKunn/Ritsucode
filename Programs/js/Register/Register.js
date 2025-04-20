$(document).ready(function () {

  var JWT;
  var userName;
  var email;

  setTimeout(function () {
    document.querySelector('.checkmark-container').classList.add('is-checked');
  }, 1000); 
  $("#iconButton").on("click", function () {
    window.location.href = "https://rickyhome.net"; 
  })

  $("#RegisterForm").on("submit", function (event) {
    event.preventDefault();
    userName = $("#username").val();
    console.log(userName);
    email = $("#email").val();
    const password = $("#password").val();
    $("#RegisterButton").prop("disabled", true).css("opacity", "0");
    $("#loadingScreen").css("display", "flex");
    $.ajax({
      url: "/php/register.php",
      type: "POST",
      data: {
        email: email,
        password: password,
        username: userName,
      },
      success: function (response) {
        try {
          JudgeResponse(1, response);
        } catch (e) {
          console.error("Error parsing JSON response:", e);
        }
        $("#loadingScreen").css("display", "none");
        $("#RegisterButton").prop("disabled", false).css("opacity", "1");
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
        $("#loadingScreen").css("display", "none");
        $("#RegisterButton").prop("disabled", false).css("opacity", "1");
      },
    });
  });

  $("#VerifyForm").on("submit", function (event) {
    event.preventDefault();
    const verifycode = $("#VerifyCode").val();

    $("#VerifyButton").prop("disabled", true).css("opacity", "0");

    $.ajax({
      url: "/php/verify.php",
      type: "POST",
      data: {
        verifycode: verifycode,
        username: userName,
      },
      success: function (response) {
        try {
          JudgeResponse(2, response);
        } catch (e) {
          console.error("Error parsing JSON response:", e);
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);

        $("#VerifyButton").prop("disabled", false).css("opacity", "1");
      },
    });
  });
  $("#VerifyCode").on("input", function () {
    const code = $(this).val();
    if (code.length === 6) {
      $("#VerifyButton").prop("disabled", false).css("opacity", "1");
    } else {
      $("#VerifyButton").prop("disabled", true).css("opacity", "0.5");
    }
  });

  async function JudgeResponse(kind, res) {
    if (kind === 1) {
      console.log(res);
      switch (res["status"]) {
        case "error":
          $("#ErrorMessage").css("opacity", "1");
          const errorMessageElement = document.getElementById("ErrorMessage");
          errorMessageElement.style.animation = 'none';
          errorMessageElement.offsetHeight; // リフローをトリガー
          errorMessageElement.style.animation = "errorBlink 2s";
          delay(1900);
          $("#ErrorMessage").css("opacity", "0");

          break;
        case "success":
          JWT = res['JWT'];
          console.log("success");
          $("#RegisterArea").css("display", "none");
          $("#VerifyArea").css("display", "block");
          await delay(50);
          $("#VerifyText").text(`${email}に届いた認証コードを入力してください`);

          break;
      }
    } else if (kind === 2) {
      console.log(res);
      switch (res["status"]) {
        case "error":
          $("#RegisterCodeErrorMessage").css("opacity", "1");
          const errorMessageElement = document.getElementById("RegisterCodeErrorMessage");
          errorMessageElement.style.animation = 'none';
          errorMessageElement.offsetHeight; // リフローをトリガー
          errorMessageElement.style.animation = "errorBlink 2s";
          delay(1900);
          $("#RegisterCodeErrorMessage").css("opacity", "0");
          $("#VerifyButton").prop("disabled", false).css("opacity", "1");
          console.log("error");
          break;
        case "success":
          console.log("success");
          localStorage.setItem('JWT', JWT);
          $("#checkmark-wrapper").css("display", "flex");
          await delay(2000);
          window.location.href = "https://rickyhome.net";

          break;
      }
    }


    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
});

