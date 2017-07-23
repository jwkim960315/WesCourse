

$(document).ready(function() {
    // Current Page Navigation Indication Event Handler
    $('.navbar-nav .nav-item').each(function(val,elem) {
        navItem = $(this).find('a').attr('href').toLowerCase();
        currentLocation = window.location.pathname;
        if (navItem === currentLocation) {
          console.log(navItem);
          console.log(currentLocation);

          $(this).addClass('active');
        };
    });

    // Prevent Empty Input Submittion Event Handler
    $('.navbar-form').submit(function(e) {
        if ($('.navbar-form .form-control').val() !== "") {
            console.log($('.navbar-form .form-control').val());
            $.ajax({
                url: `/search/query/1/1/${$('.navbar-form .form-control').val()}`,
                type: "GET"
            })
        } else {
            e.preventDefault(e);
        };
    });

    // Placeholder Disappear When Input Clicked Event Handler
    $('.navbar-form .form-control').on('focus',function() {
      $(this).attr('placeholder','');
    });

    $('.navbar-form .form-control').on('focusout',function() {
      $(this).attr('placeholder','Search any keyword...');
    });

    // Navigation Bar Appear Effect
    // $('.navbar-default').fadeIn(1000,function() {
    //   $('.header').fadeIn(1000,function() {});
    // });
})