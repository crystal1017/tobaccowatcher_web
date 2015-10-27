var $window = $(window),
		$stickyEl = $('.navbar-page'),
		elTop = $stickyEl.offset().top - 36;

$window.scroll(function() {
	$stickyEl.toggleClass('sticky', $window.scrollTop() > elTop);
});