$(document).ready(function () {

  const token = localStorage.getItem('JWT');
  if (!token) {
    console.log('You are not logged in.');
  } else {
    console.log(token);
    $.ajax({
      url: 'php/verifyToken.php',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      success: function (data) {
        if (data.status === "success") {
          console.log(data);
          window.location.href = "https://rickyhome.net/Home.html"
        }
        else {
          console.log('Token verification failed. Please log in again.');
          console.log(data.message);
          localStorage.removeItem('JWT');
        }
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
        localStorage.removeItem('JWT');
      }
    });
  }

  $("#TitleIcon").on("click", function () {
    window.location.href = "https://rickyhome.net";
  })

  $("#LoginForm").on("submit", function (event) {
    event.preventDefault();
    const Address = $("#Address").val();
    const Password = $("#Password").val();
    $.ajax({
      url: "php/login.php",
      type: "POST",
      data: {
        email: Address,
        password: Password,
      },
      success: function (response) {
        try {
          JudgeResponse(1, response);
        } catch (e) {
          console.error("Error parsing JSON response:", e);
        }
      },
    });
  });

  async function JudgeResponse(kind, res) {
    if (kind === 1) {
      switch (res["status"]) {
        case "error":
          $("#ErrorMessage").css("opacity", "1");
          const errorMessageElement = document.getElementById("ErrorMessage");
          errorMessageElement.style.animation = 'none';
          errorMessageElement.offsetHeight;
          errorMessageElement.style.animation = "errorBlink 2s";
          await delay(1900);
          $("#ErrorMessage").css("opacity", "0");
          break;
        case "success":
          console.log(res["JWT"]);
          localStorage.setItem('JWT', res["JWT"]);
          window.location.href = "https://rickyhome.net/Home.html";
          break;
      }
    }
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});


