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

  $.getScript('./notations/' + $.queryString('notation') + '/data.js').then(function() {
    notation = new Notation({
      scale: $('.g-container').innerWidth() / width,
      speed: 1,
      notationWidth: width,
      notationHeight: height
    });
    $audio[0].src = audioUrl;
    notation.init({
      sections: sections,
      notes: notes,
      times: times,
      images: images,
      audioUrl: audioUrl,
      videoUrl: videoUrl
    });
    ko.applyBindings(notation);
  });

  $audio.on('play', function() {
    notation.currentTime($audio[0].currentTime);
    window.cursor.set(true, $audio[0].currentTime, 1);
  });

  $audio.on('pause', function audioEvent() {
    notation.currentTime(false, $audio[0].currentTime);
  });

  $audio.on('timeupdate', function() {
    notation.currentTime($audio[0].currentTime);
  });

  window.setInterval(function() {
    window.cursor.set(true, $audio[0].currentTime, 1);
  }, 1000);
});
