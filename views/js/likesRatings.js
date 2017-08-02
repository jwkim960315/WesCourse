$(document).ready(function() {
    $('div.like-group > h3 > a').click(function(e) {
        e.preventDefault();
        $.ajax({
            method: 'GET',
            url: '/checkLogin',
            success: function(isLoggedIn) {
                if (!isLoggedIn) {
                    alert('You must login to "like" a rating');
                    window.location.href = '/login';
                    return;
                };
                

                console.log(e);
                $('div.like-group > h3 > a').each(function(index,elem) {
                    console.log($(`a[id="${index}"]`));
                    if ($(`a[id="${index}"]`).attr('id') === e.currentTarget.attributes[2].value) {
                        var prevLink = $(`a[id="${index}"]`).attr('data-like-link');
                        var link = (prevLink.slice(1,2) === 'u') ? `/like${prevLink.slice(7,prevLink.length)}` : `/unlike${prevLink.slice(5,prevLink.length)}`;
                        console.log(prevLink);
                        console.log(link);
                        if ($(`a[id="${index}"]`).hasClass('unliked')) {
                            $(`a[id="${index}"]`).addClass('disabled');
                            console.log('user has liked');
                            $.ajax({
                                method: 'GET',
                                url: link,
                                success: function(data) {
                                    console.log('successfully recorded');
                                    var prevLikeNum = $(`a[id="${index}"]`).next().text();
                                    var updatedLikeNum = parseInt($(`a#${index}`).parent().next().children().text())+1;
                                    $(`a[id="${index}"]`).parent().next().children().text(`${updatedLikeNum}`);
                                    $(`a[id="${index}"]`).attr('class','liked');
                                    $(`a[id="${index}"]`).attr('data-like-link',`${link}`);
                                    $(`a[id="${index}"]`).removeClass('disabled');
                                }
                            });
                        };

                        if ($(`a[id="${index}"]`).hasClass('liked')) {
                            $(`a[id="${index}"]`).addClass('disabled');
                            console.log('user has unliked');
                            $.ajax({
                                method: 'GET',
                                url: link,
                                success: function(data) {
                                    var prevLikeNum = $(`a[id="${index}"]`).next().text();
                                    var updatedLikeNum = parseInt($(`a#${index}`).parent().next().children().text())-1;
                                    $(`a[id="${index}"]`).parent().next().children().text(`${updatedLikeNum}`);
                                    $(`a[id="${index}"]`).attr('class','unliked');
                                    $(`a[id="${index}"]`).attr('data-like-link',`${link}`);
                                    $(`a[id="${index}"]`).removeClass('disabled');   
                                }
                            });
                        };

                    }
                });

            }
        })

        
    })
    
})