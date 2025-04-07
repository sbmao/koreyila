function prependMenuMobile() {
  var appendPrependMenuMobile = function() {
    if (window.innerWidth < 1025) {
      $('.header-top--wrapper .header-top--left .customer-service-text').appendTo('#navigation-mobile .site-nav-mobile.nav-account .wrapper-links');
    } else {
      $('#navigation-mobile .site-nav-mobile.nav-account .customer-service-text').appendTo('.header-top--wrapper .header-top--left .header-language_currency');
    };
  };

  $(document).ready(function() {
    appendPrependMenuMobile();
  });

  $(window).on('resize', function () {
    appendPrependMenuMobile();
  })

  $(window).on('load', function () {
    $('.header-05').addClass('loading-css');
  });

  if ($('body').hasClass('template-index')) $('.header-basic--transparent').closest('.section-header-basic').addClass('shb-transparent');
}

prependMenuMobile();