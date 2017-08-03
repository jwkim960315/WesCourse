$(document).ready(function() {
  
  // Check Login Status
  $.ajax({
      method: 'GET',
      url: '/checkLogin',
      success: function(isLoggedIn) {
          if (!isLoggedIn) {
              alert('You must login to evaluate this course');
              window.location.href = '/login';
              return;
          };
      }
  });


  // Form Validator
  $('form[action="/submittingRating"]').validate({
    rules: {
      courseId: "required",
      option: "required"
    },
    messages: {
      courseId: "Please Enter a Valid Course ID",
      option: "Please Choose One of the Options Above"
    },
    errorPlacement: function(error, element) {
      var placement = $(element).data('error');
      console.log(element.closest('.form-group').find('div.err'));
      element.closest('.form-group').find('div.err').html(error);  
      $(window).scrollTop(0);
      return;
    }
  });

  // Radio Empty Input Error Message Disappear on Click
  $('div.iradio_square-red ins').click(function() {
    console.log('HERE')
    $('div#recommend').closest('.form-group').find('div.err').hide();
  })
});

