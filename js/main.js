$(function() {
  var $audio = $('#audio')[0],
    notation,
    playing = false;

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

  $.getJSON('./data/' + $.queryString('notation') + '/data.json').then(function(options) {
    var $content = $('.g-content'),
      widthScale = $content.innerWidth() / options.width,
      heightScale = $content.innerHeight() / options.height,
      isAutoSlide = false;

    $audio.src = './data/' + options.title + '/audio.mp3';

    notation = new Notation({
      scale: widthScale > heightScale ? heightScale : widthScale,
      speed: 1,
      showNumber: widthScale >= heightScale * 2 ? 2 : 1,
      title: options.title,
      sections: options.sections,
      notes: options.notes,
      times: options.times,
      width: options.width,
      height: options.height,
      sum: options.sum
    });

    notation.changeSection = function(section) {
      if ($audio.readyState >= 4) {
        $audio.currentTime = section.startTime + 0.00005;
      }
    };

    ko.applyBindings(notation);

    var swiper = new Swiper('.swiper-container', {
      speed: 200,
      mousewheel: true,
      keyboard: true
    });

    swiper.on('slideChange', function() {
      if (!isAutoSlide) {
        $audio.pause();
      }
    });

    notation.currentSectionIndex.subscribe(function() {
      var index = notation.currentRubbingIndex(),
        rubbings = notation.rubbings(),
        slideToIndex;

      if (index === undefined) {
        return;
      }

      slideToIndex = rubbings[index].notationIndex - 1;

      if (slideToIndex !== swiper.realIndex) {
        isAutoSlide = true;
        swiper.slideTo(slideToIndex, 200);
        setTimeout(function() {
          isAutoSlide = false;
        }, 200);
      }
    });
  });

  $audio.onplaying = function() {
    playing = true;
    window.cursor.set(playing, $audio.currentTime, 1);
  };

  $audio.onwaiting = function() {
    playing = false;
    window.cursor.set(playing, $audio.currentTime, 1);
  };

  $audio.onpause = function() {
    playing = false;
    window.cursor.set(playing, $audio.currentTime, 1);
  };

  $audio.onseeked = function() {
    window.cursor.set(playing, $audio.currentTime, 1);
  };

  $audio.ontimeupdate = function() {
    notation.currentTime($audio.currentTime);
    window.cursor.set(playing, $audio.currentTime, 1);
  };

  //监听页面变化
  window.addEventListener('orientationchange', function() {
    window.location.reload();
  });
  //防止页面从缓存加载
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      window.location.reload();
    }
  });
});
