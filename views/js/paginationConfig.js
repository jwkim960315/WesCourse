// $(document).ready(function() {
	function pageNavOnClick (selectedState,fieldAc,courseAc,currentSectionNum,currentPageNum) {
		console.log(selectedState);

		$.ajax({
			url: '/specific-course-pagination',
			type: 'GET',
			data: {
				selectedState,
				fieldAc,
				courseAc,
				currentSectionNum,
				currentPageNum
			},
			success: function(data) {

			}
		})
	};

	// $('nav ul.pagination a').click(function (e) {
	// 	console.log(e.currentTarget.dataset.currentPageNum);

	// 	$.ajax({
	// 		type: 'GET',
	// 		url: '/specific-course-pagination',
	// 		data: {
	// 			selectedButton: e.currentTarget.dataset.currentPageNum
	// 		}
	// 	})
	// })
// })