
$(document).ready(function() {
  // Buttons Show & Hide Event
  $('.upload-options, .updateToCustomImg-options, .updateToGoogleImg-options').hide();

  $('#img-toggle').click(function (e) {
    e.preventDefault();
    $('.upload-options, .updateToCustomImg-options, .updateToGoogleImg-options').toggle();
  });

  // Image Hover Effect
  $('.user-image-mod .user-image-mod-inside a').hover(function() {
      $('.user-image-mod div').stop().animate({
        borderColor: '7px solid rgb(171,171,171)'
      },180,"linear");
    },
    function() {
      $('.user-image-mod div').stop().animate({
        borderColor: '7px solid rgb(221,221,221)'
      },180,"linear");
  });

  // Image Preview Handler
  $('input[type="file"]').on('change',function(e) {

    console.log('File has been uploaded');
    
    var url = this.value;
    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
    if (this.files && this.files[0] && url !== '') {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('div.image-preview img').attr('src', e.target.result);
        };

        reader.readAsDataURL(this.files[0]);
    }
  });

  // Image Upload Validator
  $('form[action="/profile/uploadCustomImg"]').submit(function(e) {
    if ($('input[type="file"]').val() === "") {
      e.preventDefault();
    }
  });
});