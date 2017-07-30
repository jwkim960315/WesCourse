$(document).ready(function() {
    $('div.like-group > h3 > a').click(function(e) {
        $.ajax({
            method: 'GET',
            url: '/checkLogin',
            success: function(isLoggedIn) {
                if (!isLoggedIn) {
                    $('input').val("");
                    $('.form-check-input').prop('checked',false);
                    alert('You must login to evaluate this course');
                    window.location.href = '/login';
                    return;
                };
                e.preventDefault();
                
                if ($('div.like-group > h3 > a > i').hasClass('not-liked')) {
                    var link = `/like${$('div.like-group > h3 > a > i').attr('data-like-link')}`;
                    $('div.like-group > h3 > a').addClass('disabled');
                    $.ajax({
                        method: 'GET',
                        url: link,
                        success: function(data) {
                            $('div.like-group > h3 > a').html(`<i class="fa fa-heart liked" data-like-link="${link}" aria-hidden="true"></i>`);
                            $('div.like-group > h3 > a').removeClass('disabled');
                        }
                    });
                };

                if ($('div.like-group > h3 > a > i').hasClass('liked')) {
                    var link = `/unlike${$('div.like-group > h3 > a > i').attr('data-like-link')}`;
                    console.log('HERE');
                    $('div.like-group > h3 > a').addClass('disabled');
                    $.ajax({
                        method: 'GET',
                        url: link,
                        success: function(data) {
                            $('div.like-group > h3 > a').html(`<i class="fa fa-heart not-liked" data-like-link="${link}" aria-hidden="true"></i>`);
                            $('div.like-group > h3 > a').removeClass('disabled');   
                        }
                    });
                };

            }
        })

        
    })
    
})