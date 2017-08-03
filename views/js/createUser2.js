
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
});