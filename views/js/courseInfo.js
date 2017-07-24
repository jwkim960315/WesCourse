
$(document).ready(function(e) {

	if ($(this).width() <= 992) {
		$('.class-time').removeClass("text-right");
	} else if ($(this).width() > 992 && !($('.class-time').hasClass('text-right'))) {
		$('.class-time').addClass("text-right");
	};

	$(window).resize(function() {
		if ($(this).width() <= 992) {
			$('.class-time').removeClass("text-right");
		} else if ($(this).width() > 992 && !($('.class-time').hasClass('text-right'))) {
			$('.class-time').addClass("text-right");
		};
	})
})