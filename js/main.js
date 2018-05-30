$(function() {
  var $audio = $('#audio')[0],
    isMobile = !!navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i),
    notation,
    seekTimer;

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

  var isBuffered = function(currentTime) {
    for (i = 0; i < $audio.buffered.length; i++) {
      if (currentTime > $audio.buffered.start(i) && currentTime < $audio.buffered.end(i)) {
        return true;
      }
    }

    return false;
  };

  var playing = function() {
    return $audio
      && isBuffered($audio.currentTime)
      && !$audio.paused
      && !$audio.ended
      && $audio.readyState > 2;
  };

  $.getJSON('./data/' + $.queryString('notation') + '/data.json').then(function(options) {
    var $content = $('.g-content'),
      isAutoSlide = false,
      showNumber = ($content.innerWidth() / $content.innerHeight()) > 1.3 ? 2 : 1,
      widthScale = $content.innerWidth() / (options.width * showNumber),
      heightScale = $content.innerHeight() / options.height;

    notation = new Notation({
      scale: widthScale > heightScale ? heightScale : widthScale,
      speed: 1,
      showNumber: showNumber,
      title: options.title,
      sections: options.sections,
      notes: options.notes,
      times: options.times,
      width: options.width,
      height: options.height,
      sum: options.sum
    });

    notation.hasArrow = ko.observable(!isMobile);

    notation.changeSection = function(section) {
      var seekTo;

      window.clearInterval(seekTimer);

      if (section.notes && section.notes.length) {
        seekTo = section.notes[0].time + 0.00005;
        $audio.currentTime = seekTo;
        notation.currentTime(seekTo);
        window.cursor.set(playing(), seekTo, 1);
        $audio.pause();
        seekTimer = window.setInterval(function() {
          if (isBuffered(seekTo)) {
            window.clearInterval(seekTimer);
            $audio.play();
          }
        }, 200);
      }
    };

    notation.refresh = function() {
      window.location.reload();
    };

    ko.applyBindings(notation);

    var swiper = new Swiper('.swiper-container', {
      speed: 200,
      mousewheel: true,
      keyboard: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    });

    swiper.on('slideChange', function() {
      if (!isAutoSlide) {
        $audio.pause();
      }
    });

    ko.computed(function() {
      var swiperIndex = notation.currentSwiperIndex();
      var sectionIndex = notation.currentSectionIndex();

      console.log('当前播放小节序号' + sectionIndex);

      if (swiperIndex === undefined) {
        return;
      }

      if (swiperIndex !== swiper.realIndex) {
        isAutoSlide = true;
        swiper.slideTo(swiperIndex, 200);
        setTimeout(function() {
          isAutoSlide = false;
        }, 200);
      }
    });
  });

  $audio.ontimeupdate = function() {
    notation.currentTime($audio.currentTime);
    window.cursor.set(playing(), $audio.currentTime, 1);
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

  window.addEventListener('orientationchange', function() {
    switch (window.orientation) {
      case -90 || 90:
        window.location.reload();
        break;
      default:
        break;
    }
  });

  window.addEventListener('resize', function() {
    var explorer = window.navigator.userAgent.toLowerCase();
    if (explorer.indexOf('chrome') > 0) {//webkit
      if (document.body.scrollHeight === window.screen.height && document.body.scrollWidth === window.screen.width) {
        window.location.reload();
      } else {
        console.log('不全屏');
      }
    } else {//IE 9+  fireFox
      if (window.outerHeight === window.screen.height && window.outerWidth === window.screen.width) {
        window.location.reload();
      } else {
        console.log('不全屏');
      }
    }
  });
});
