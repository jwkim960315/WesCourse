$(document).ready(function() {
  // Overall Ratings Number Color Modifier
  score = parseFloat($('.overall-ratings .overall-ratings-num p').text());
  if (0 <= score && score < 2) {
    $('.overall-ratings .overall-ratings-num p').css('color','rgb(217, 83, 79)');
  } else if (2 <= score && score < 3) {
    $('.overall-ratings .overall-ratings-num p').css('color','rgb(240, 173, 78)');
  } else if (3 <= score && score < 4) {
    $('.overall-ratings .overall-ratings-num p').css('color','rgb(2, 117, 216)');
  } else if (4 <= score && score <= 5) {
    $('.overall-ratings .overall-ratings-num p').css('color','rgb(92, 184, 92)');
  };

  // Individual Rating Numbers Color Modifier
  $('#rated-ratings h4 span').each(function(index) {
    score = parseFloat($(this).text());
    if (0 <= score && score < 2) {
      $(this).css('color','rgb(217, 83, 79)');
    } else if (2 <= score && score < 3) {
      $(this).css('color','rgb(240, 173, 78)');
    } else if (3 <= score && score < 4) {
      $(this).css('color','rgb(2, 117, 216)');
    } else if (4 <= score && score <= 5) {
      $(this).css('color','rgb(92, 184, 92)');
    }
  });
})