// Unique Username Validator
$(document).ready(function() {
  $('#course-acronym').on('input',function(e) {
      $.ajax({
          url: '/checkCourseAcronym',
          method: 'POST',
          data: {
            courseAc: $('#course-acronym').val()
          },
          success: function(exists) {
              $('#course-acronym-err').show();
              if (exists === "noInput") {
                  $('.form-submit').prop('disabled',true);
                  $('.form-submit').css('opacity','.3');
                  
                  $('#course-acronym-err').switchClass('course-acronym-success','course-acronym-err',0);
                  $('#course-acronym-err').text('Please Enter a Valid Course ID');
              }
              
              console.log(exists);
              if (!exists) {
                  $('.form-submit').prop('disabled',true);
                  $('.form-submit').css('opacity','.3');
                  
                  $('#course-acronym-err').switchClass('course-acronym-success','course-acronym-err',0);
                  $('#course-acronym-err').text("Invalid Course ID");
              } else if (exists === true) {
                  $('.form-submit').prop('disabled',false);
                  $('.form-submit').css('opacity','1');
                  $('#course-acronym-err').switchClass('course-acronym-err','course-acronym-success',0);
                  $('#course-acronym-err').text(`${$('#course-acronym').val()} works!`);
              }
          }
      });
    });
});
    

