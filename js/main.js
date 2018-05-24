$(function() {
  var $audio = $('#audio')[0],
    notation,
    isMobile = !!navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i),
    playing = function() {
      return $audio
        && $audio.buffered.length > 0
        && $audio.currentTime > $audio.buffered.start(0)
        && $audio.currentTime <= $audio.buffered.end($audio.buffered.length - 1)
        && !$audio.paused
        && !$audio.ended
        && $audio.readyState > 2;
    };

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

    notation = new Notation({
      scale: widthScale > heightScale ? heightScale : widthScale,
      speed: 1,
      showNumber: ($content.innerWidth() / $content.innerHeight()) > 1.3 ? 2 : 1,
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
      if (section.notes && section.notes.length) {
        $audio.currentTime = section.notes[0].time + 0.00005;
        notation.currentTime($audio.currentTime);
        window.cursor.set(playing(), $audio.currentTime, 1);
      }
    };

    ko.applyBindings(notation);

    var swiper = new Swiper('.swiper-container', {
      speed: 200,
      mousewheel: true,
      keyboard: true,
      pagination: {
        el: '.swiper-pagination',
        type: 'fraction',
        renderFraction: function(currentClass, totalClass) {
          return '- <span class="' + currentClass + '"></span>' +
            ' of ' +
            '<span class="' + totalClass + '"></span> -';
        }
      },
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

  window.addEventListener('resize', function() {
    window.location.reload();
  });
});
