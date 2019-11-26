var Nav = (function() {

  var
  	nav 		= $('.nav'),
    section = $('.section'),
    options = $('#optionsDiv'),
    link		= nav.find('.nav__link'),
    optionsLink = options.find('.options--link'),
    navH		= nav.innerHeight(),
    isOpen 	= true,
    hasT 		= false;

  var toggleNav = function() {
    nav.toggleClass('nav--active');
  };


  var switchPage = function(e) {
    var self = $(this);
    var i = self.parents('.nav__item').index();
    var s = section.eq(i);
    var a = $('section.section--active');
    var t = $(e.target);

    if (!hasT) {
      if (i == a.index()) {
        return false;
      }
      a.addClass('section--hidden').removeClass('section--active');
      s.addClass('section--active');

      if(self[0]["id"] != "dashboardLink") {
        var idText = "#" + self[0]["id"];
        $('#optionsDiv').addClass('options--hide');
      }
      else {
        setTimeout(displayOptions, 500);
        function displayOptions() {
          $('#optionsDiv').removeClass('options--hide');
        }
      }

      hasT = true;

      a.on('transitionend webkitTransitionend', function() {
        $(this).removeClass('section--hidden');
        hasT = false;
        a.off('transitionend webkitTransitionend');
      });
    }

    return false;
  };

  var switchOptions = function(e) {
    var self = $(this);
    if(self[0].classList.contains('options--active') != true && self[0]["id"] == 'legendLink') {
      console.log('active class');
      $('#legendThumb').addClass('color2').removeClass('color4');
      $('#searchThumb').addClass('color4').removeClass('color2');
      $('#searchLink').removeClass('options--active');
      $('#legendLink').addClass('options--active');
      searchBox = document.getElementById('Search');
      legendBox = document.getElementById('Legend');
      searchBox.style.display = 'none';
      legendBox.style.display = 'block';
    }

    else if(self[0].classList.contains('options--active') != true && self[0]["id"] == 'searchLink') {
      $('#searchThumb').addClass('color2').removeClass('color4');
      $('#legendThumb').addClass('color4').removeClass('color2');
      $('#legendLink').removeClass('options--active');
      $('#searchLink').addClass('options--active');
      searchBox = document.getElementById('Search');
      legendBox = document.getElementById('Legend');
      searchBox.style.display = 'block';
      legendBox.style.display = 'none';
    }
  }

  var bindActions = function() {
    link.on('click', switchPage);
    optionsLink.on('click', switchOptions);
    $(document).on('ready', function() {
       $( '.page' ).css({
        'transform': 'translateY(' + navH + 'px)',
         '-webkit-transform': 'translateY(' + navH + 'px)'
      });
    });
  };

  var init = function() {
    bindActions();
  };

  return {
    init: init
  };

}());

Nav.init();
