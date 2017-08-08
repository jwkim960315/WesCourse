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
        url: `/searching`,
        data: {keyword},
        success: function(data) {
            
            if (!data) {
                return $('.courses-group').stop().fadeOut(1);
            };

            if (data === "-1") {
                $('.courses-group').fadeIn(400);
                return $('div.list-group').html(`<div class="categories list-group-item">
                                                    <p>No Matching Results Found</p>
                                                 </div>`);
            };
            
            myHilitor = new Hilitor("courses-group");

            template = "";

            for (var i=0; i < Object.keys(data.data).length; i++) {
                
                template += `<div class="categories list-group-item">
                                <p>${Object.keys(data.data)[i]}</p>
                            </div>`;
                data.data[Object.keys(data.data)[i]].forEach((obj,index,arr) => {


                    obj.professors = obj.professors.replace(/;/g,"<br/>");

                    splittedLst = obj.term_name.split(";");
                    

                    if (splittedLst.length !== 1 && splittedLst[0] !== splittedLst[1]) {
                        obj.term_name = `${splittedLst[0]} & ${splittedLst[1]}`; 

                    } else {
                        obj.term_name = splittedLst[0];
                    };


                    template += `<a class="list-group-item action courses" href="/catalog/${obj.field_acronym}/${obj.course_acronym}/1/1">
                                    <div class="col-6">
                                        <div class="course-acronyms">
                                            <p>Course: ${obj.course_acronym}</p>
                                        </div>

                                        <div class="course-names">
                                            <p>${obj.course_name}</p>
                                        </div>

                                        <div class="sections">
                                            <p>Section: ${obj.section}</p>
                                        </div>

                                        <div class="term-names">
                                            <p>Term: ${obj.term_name}</p>
                                        </div>
                                    </div>

                                    <div class="col-6 professors">
                                        
                                            <p>Professor(s): </p>
                                            <p>${obj.professors}</p>
                                    </div>
                                </a>`;
                });
            };

            if (data.dataLength > 10) {
                template += `<a href="/search/query/1/1/${keyword}" class="list-group-item">
                                <p id="view-all">View All Results</p>
                             </a>`;
            };
            
            $('div.list-group').html(template);

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

window.onbeforeunload = function(){ window.scrollTo(0,0); }