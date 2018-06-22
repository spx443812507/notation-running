var tag = document.createElement('script');
tag.src = 'http://www.youtube.com/player_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var $media;
isMobile = !!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|ios)/i);

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

function onYouTubePlayerAPIReady() {
  var isBuffered = function(currentTime) {
    return $media.getVideoLoadedFraction() >= currentTime / $media.getDuration();
  };

  var playing = function() {
    return $media && $media.getPlayerState() === 1;
  };

  $('.youtube').addClass(!!navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i) ? 'left-bottom' : 'right-top');

  $.getJSON('./data/' + $.queryString('notation') + '/data.json').then(function(options) {
    var isPlayed = false;

    $media = new YT.Player('player', {
      height: '180',
      width: '270',
      videoId: options.videoId,
      playerVars: {
        playsinline: 1
      },
      events: {
        'onReady': function() {
          onPlayerReady(options);
        },
        'onStateChange': function() {
          if (playing()) {
            //第一次手动播放后自动隐藏播放器并且设置可以拖动的样式
            if (!isPlayed) {
              isPlayed = true;
              $('iframe').addClass('playing');
              $('#player').slideToggle();
            }
            $('.icon-play').addClass('active');
            $('.tool-bar-toggle').addClass('active');
          } else {
            $('.icon-play').removeClass('active');
            $('.tool-bar-toggle').removeClass('active');
          }
        }
      }
    });
  });

  function onPlayerReady(options) {
    var isAutoSlide = false,
      notation,
      seekTimer,
      $content,
      showNumber,
      widthScale,
      heightScale;

    $content = $('.g-content').css({top: 0});
    showNumber = ($content.innerWidth() / $content.innerHeight()) > 1.3 ? 2 : 1;
    widthScale = $content.innerWidth() / (options.width * showNumber);
    heightScale = $content.innerHeight() / options.height;

    $('.draggable').show().draggable({
      iframeFix: true
    });

    $('.tool-bar-toggle').on('click', function() {
      $('.tool-bar-menu').slideToggle();
    });

    $('.icon-back').on('click', function() {
      window.history.go(-1);
    });

    $('.icon-refresh').on('click', function() {
      window.location.reload();
    });

    $('.icon-play').on('click', function() {
      if ($media.getPlayerState() === 1) {
        $media.pauseVideo();
      } else {
        $media.playVideo();
      }
    });

    $('.icon-visible').on('click', function() {
      $(this).toggleClass('active');
      $('#player').toggle();
    });

    window.setInterval(function() {
      notation.currentTime($media.getCurrentTime());
      window.cursor.set(playing(), $media.getCurrentTime(), 1);
    }, 250);

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
        $media.seekTo(parseFloat(seekTo));
        window.cursor.set(playing(), seekTo, 1);
        $media.pauseVideo();
        seekTimer = window.setInterval(function() {
          if (isBuffered(seekTo)) {
            window.clearInterval(seekTimer);
            $media.playVideo();
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
        $media.pauseVideo();
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
        if (document.body.scrollHeight === window.screen.height && document.body.scrollWidth ===
          window.screen.width) {
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
  }
}
