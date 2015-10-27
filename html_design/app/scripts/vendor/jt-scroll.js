$('.jt-scrollto').click(function() {
  $('html,body').animate({ scrollTop: $(this.hash).offset().top}, 500);
  return false;
});