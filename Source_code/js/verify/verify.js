$(document).ready(function(){
  $('#RoomSetting').on('submit', function(event){
      event.preventDefault();
      const UserName = $('#UserName').val();
      const Address = $('#Address').val();
      const Password = $('#Password').val();
      $('#RegisterButton').prop('disabled', true).css('opacity', '0');

      $.ajax({
          url: 'php/register.php',
          type: 'POST',
          data: {
            mailAddress : Address,
            password : Password,
            userName : UserName

          },
          success: function(response){
            JudgeResponse(JSON.parse(response));
            $('#RegisterButton').prop('disabled', false).css('opacity', '1');
          }
      });
  });

  $('#VerifyCode').on('input', function() {
        const code = $(this).val();
        if (code.length === 6) {
          $('#RegisterButton').prop('disabled', false).css('opacity', '1');
        } else {
          $('#RegisterButton').prop('disabled', true).css('opacity', '0.5');
        }
});



  function JudgeResponse(res){ 
    switch(res['status']){
      case 'error':
        console.log("error");
        break;
      case 'success':
        console.log("success");
        break;
    }
  }
});
