$(function() {
  var $audio = $('#audio'),
    notation;

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

    $audio[0].src = './data/' + options.title + '/audio.mp3';

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
      $audio[0].currentTime = section.startTime;
      notation.currentTime($audio[0].currentTime);
      window.cursor.set($audio[0].paused, $audio[0].currentTime, 1);
    };

    ko.applyBindings(notation);

    var swiper = new Swiper('.swiper-container', {
      speed: 150,
      mousewheel: true,
      keyboard: true
    });

    swiper.on('slideChange', function() {
      if (!isAutoSlide) {
        $audio[0].pause();
      }
    });

    notation.currentSectionIndex.subscribe(function() {
      var index = notation.currentRubbingIndex(),
        rubbings = notation.rubbings();

      if (index !== undefined && index !== swiper.realIndex) {
        isAutoSlide = true;
        swiper.slideTo(rubbings[index].notationIndex - 1, 150);
        setTimeout(function() {
          isAutoSlide = false;
        }, 150);
      }
    });
  });

  $audio.on('play', function() {
    window.cursor.set($audio[0].paused, $audio[0].currentTime, 1);
  });

  $audio.on('pause', function audioEvent() {
    window.cursor.set($audio[0].paused, $audio[0].currentTime, 1);
  });

  $audio.on('timeupdate', function() {
    notation.currentTime($audio[0].currentTime);
    window.cursor.set($audio[0].paused, $audio[0].currentTime, 1);
  });

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
