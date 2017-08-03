// Image Hover Effect
$(document).ready(function() {

  $('.upload-options, .updateToCustomImg-options, .updateToGoogleImg-options').hide();

  $('.user-image-mod a').hover(function() {
      $('.user-image-mod div').stop().animate({
        borderColor: '7px solid rgb(171,171,171)'
      },180,"linear");
    },
    function() {
      $('.user-image-mod div').stop().animate({
        borderColor: '7px solid rgb(221,221,221)'
      },180,"linear");
  });
});