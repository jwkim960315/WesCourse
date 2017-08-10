$(document).ready(function() {
  // Overall Ratings Number Color Modifier
  // score = parseFloat($('.overall-ratings .overall-ratings-num p').text());
  // if (1 <= score && score < 2) {
  //   $('.overall-ratings .overall-ratings-num p').css('color','rgb(217, 83, 79)');
  // } else if (2 <= score && score < 3) {
  //   $('.overall-ratings .overall-ratings-num p').css('color','rgb(240, 173, 78)');
  // } else if (3 <= score && score < 4) {
  //   $('.overall-ratings .overall-ratings-num p').css('color','rgb(2, 117, 216)');
  // } else if (4 <= score && score < 5) {
  //   $('.overall-ratings .overall-ratings-num p').css('color','rgb(91, 192, 222)');
  // } else if (score === 5) {
  //   $('.overall-ratings .overall-ratings-num p').css('color','rgb(92, 184, 92)');
  // };

  // Individual Rating Numbers Color Modifier
  // $('.indiv-ratings-num').each(function(index) {
  //   score = parseFloat($(this).text());
  //   if (1 <= score && score < 2) {
  //     $(this).css('color','rgb(217, 83, 79)');
  //   } else if (2 <= score && score < 3) {
  //     $(this).css('color','rgb(240, 173, 78)');
  //   } else if (3 <= score && score < 4) {
  //     $(this).css('color','rgb(2, 117, 216)');
  //   } else if (4 <= score && score < 5) {
  //     $(this).css('color','rgb(91, 192, 222)');
  //   } else if (score === 5) {
  //     $(this).css('color','rgb(92, 184, 92)');
  //   }
  // });

  // // Individual Rater's Username Color Modifier
  // $('.panel .panel-heading h3').each(function(index,elem) {
  //   totalScore = 0;
  //   $(this).parent()
  //          .next()
  //          .children('.all-ratings')
  //          .children()
  //          .children()
  //          .children()
  //          .children('.indiv-ratings-num')
  //          .each(function(index) {
  //     if (index !== 4) {
  //       totalScore += parseFloat($(this).text());  
  //     };
  //   });

  //   avgScore = (totalScore/4.0).toFixed(2);
  //   console.log(avgScore);
  //   if (1 <= avgScore && avgScore < 2) {
  //     $(elem).css('color','rgb(217, 83, 79)');
  //   } else if (2 <= avgScore && avgScore < 3) {
  //     $(elem).css('color','rgb(240, 173, 78)');
  //   } else if (3 <= avgScore && avgScore < 4) {
  //     $(elem).css('color','rgb(2, 117, 216)');
  //   } else if (4 <= avgScore && avgScore < 5) {
  //     $(elem).css('color','rgb(91, 192, 222)');
  //   } else if (avgScore === 5) {
  //     $(elem).css('color','rgb(92, 184, 92)');
  //   }
  // })
})