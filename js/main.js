$(function() {
  var $audio = $('#audio'),
    notation,
    isPlaying = false;

  //获取url中指定参数名的值
  $.queryString = function(name, url) {
    var queryUrl = url || document.URL;
    var reg = new RegExp('[?|&]' + name + '=([^&#/]*)', 'i');
    if (queryUrl.indexOf('?') > -1) {
      var search = queryUrl.substr(queryUrl.indexOf('?'));
      var r = search.match(reg);
      if (r != null) {
        return decodeURIComponent(r[1]);
      }
      return null;
    }
    return null;
  };

  var debounce = function(action, idle) {
    var last;
    return function() {
      var ctx = this, args = arguments;
      clearTimeout(last);
      last = setTimeout(function() {
        action.apply(ctx, args);
      }, idle);
    };
  };

  $.getJSON('./data/' + $.queryString('notation') + '/data.json').then(function(options) {
    var $content = $('.g-content'),
      widthScale = $content.innerWidth() / options.width,
      heightScale = $content.innerHeight() / options.height,
      isScrolling = false,
      scrollDebounce = debounce(function() {
        isScrolling = false;
      }, 800);

    $audio[0].src = './data/' + options.title + '/audio.mp3';

    notation = new Notation({
      scale: widthScale > heightScale ? heightScale : widthScale,
      speed: 1,
      title: options.title,
      sections: options.sections,
      notes: options.notes,
      times: options.times,
      width: options.width,
      height: options.height,
      sum: options.sum
    });

    notation.currentPageIndex.subscribe(function(index) {
      if (index !== undefined) {
        var scrollTo = $('.page:eq(' + index + ')');

        if (!isScrolling && scrollTo.length) {
          $content.animate({
            scrollTop: scrollTo.css('top')
          }, 500);
        }
      }
    });

    ko.applyBindings(notation);

    $content.on('scroll', function() {
      isScrolling = true;
      scrollDebounce();
    });
  });

  $audio.on('play', function() {
    isPlaying = true;
    window.cursor.set(isPlaying, $audio[0].currentTime, 1);
  });

  $audio.on('pause', function audioEvent() {
    isPlaying = false;
    window.cursor.set(isPlaying, $audio[0].currentTime, 1);
  });

  $audio.on('timeupdate', function() {
    notation.currentTime($audio[0].currentTime);
    window.cursor.set(isPlaying, $audio[0].currentTime, 1);
  });

  window.setInterval(function() {
    window.cursor.set(isPlaying, $audio[0].currentTime, 1);
  }, 1000);
});
