
$(document).ready(function() {
    $('.navbar-nav .nav-item').each(function(val,elem) {
        navItem = $(this).find('a').attr('href').toLowerCase().slice(1);
        currentLocation = window.location.pathname;
        slashIndex = currentLocation.slice(1).indexOf('/');
        
        if (slashIndex !== -1) {
            currentLocation = currentLocation.slice(1,slashIndex+1);
        } else {
            currentLocation = currentLocation.slice(1);    
        };

        if (navItem === currentLocation.toLowerCase()) {
          $(this).addClass('active');
        };
    });



    // Unique Username Validator
    $('#inputUsername1').on('input',function(e) {
      $.ajax({
          url: '/checkUsername',
          method: 'POST',
          data: {
            username: $('#inputUsername1').val()
          },
          success: function(isUnique) {
              $('#inputUsername1-err').show();
              if (isUnique === "noInput") {
                  $('.createUser button.loginBtn.loginBtn--google').prop('disabled',true);
                  $('.createUser button.loginBtn.loginBtn--google').css('opacity','.3');
                  
                  $('#inputUsername1-err').switchClass('inputUsername1-success','inputUsername1-err',0);
                  $('#inputUsername1-err').text('You must enter a username you wish to use');
              }

              if (!isUnique) {
                  $('.createUser button.loginBtn.loginBtn--google').prop('disabled',true);
                  $('.createUser button.loginBtn.loginBtn--google').css('opacity','.3');
                  
                  $('#inputUsername1-err').switchClass('inputUsername1-success','inputUsername1-err',0);
                  $('#inputUsername1-err').text("Username already exists");
              } else if (isUnique === true) {
                  $('.createUser button.loginBtn.loginBtn--google').prop('disabled',false);
                  $('.createUser button.loginBtn.loginBtn--google').css('opacity','1');
                  $('#inputUsername1-err').switchClass('inputUsername1-err','inputUsername1-success',0);
                  $('#inputUsername1-err').text(`${$('#inputUsername1').val()} works!`);
              }
          }
      });
    });

    $('.createUser').submit(function(e) {
      console.log($('#inputUsername1').val().trim().length);
      if ($('#inputUsername1').val().trim().length === 0) {
        $('#inputUsername1-err').show();
        $('#inputUsername1-err').prop('disabled',true);
        $('.createUser button.loginBtn.loginBtn--google').css('opacity','.3');
        $('#inputUsername1-err').switchClass('inputUsername1-success','inputUsername1-err',0);
        $('#inputUsername1-err').text('You must enter a username you desire');
        e.preventDefault(e);
      }
    });
});