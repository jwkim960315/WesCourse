// Search Input focusOut Event Handler
$('.courses-group').hover(function() {
    $('.courses-group').data('clicked',true);
} , function() {
    $('.courses-group').data('clicked',false);
});

$('input[type="text"]').on({
    focusin: function() {
        if ($(this).val() !== "") {
            $('.courses-group').fadeIn(400);
        };
    },
    focusout: function() {
        if (!$('.courses-group').data('clicked')) {
            $('.courses-group').hide();
        }
    }
})



// Search Bar Suggested Search Results Handler
$('.search-keyword').on('input', function() {

    keyword = $('.search-keyword').val();

    $.ajax({
        url: '/searching',
        data: {keyword},
        success: function(data) {
            
            if (!data) {
                return $('.courses-group').stop().fadeOut(1);
            };

            if (data === "-1") {
                $('.courses-group').fadeIn(400);
                return $('ul.list-group.inside-courses-group').html(`<li class="list-group-item categories">
                                                    <p>No Matching Result Found</p>
                                                </li>`);
            };
            
            myHilitor = new Hilitor("courses-group");

            template = "";

            for (var i=0; i < Object.keys(data.data).length; i++) {
                
                template += `<li class="list-group-item categories">
                                
                                    <p>${Object.keys(data.data)[i]}</p>
                                
                             </li>`;
                             
                data.data[Object.keys(data.data)[i]].forEach((obj,index,arr) => {


                    obj.professors = obj.professors.replace(/;/g,"<br/>");

                    splittedLst = obj.term_name.split(";");
                    

                    if (splittedLst.length !== 1 && splittedLst[0] !== splittedLst[1]) {
                        obj.term_name = `${splittedLst[0]} & ${splittedLst[1]}`; 

                    } else {
                        obj.term_name = splittedLst[0];
                    };


                    template += `<li class="list-group-item">
                                     <a class="action courses" href="/catalog/${obj.field_acronym}/${obj.course_acronym}/likes">
                                        <div class="row">
                                            <div class="col-md-6 col-xs-12 course-acronyms">
                                                <p>Course: ${obj.course_acronym}</p>
                                            </div>
                                            <div class="col-md-6 col-xs-12 professors text-left">
                                                <p>Professor(s): ${obj.professors}</p>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-xs-12 clearfix course-names">
                                                <p>${obj.course_name}</p>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-xs-12 sections">
                                                <p>Section: ${obj.section}</p>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-xs-12 term-names">
                                                <p>Term: ${obj.term_name}</p>
                                            </div>
                                        </div>
                                    </a>
                                </li>`;
                });
            };

            if (data.dataLength > 10) {
                template += `<li class="list-group-item">
                                 <a href="/search/query/1/1/${keyword}" class="text-center">
                                    <p id="view-all">View All Results</p>
                                 </a>
                             </li>`;
            };
            
            $('ul.list-group.inside-courses-group').html(template);

            myHilitor.setMatchType("open");
            myHilitor.apply(keyword);
            
            $('.courses-group').fadeIn(400);
        }
    })
});

// Width Align Handler
$(document).ready(function() {  
    $('.courses-group').hide();
});

// window.onbeforeunload = function(){ window.scrollTo(0,0); }