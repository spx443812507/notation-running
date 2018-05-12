$(function() {
  var $audio = $('#audio'),
    notation = new Notation({
      scale: $('.g-container').innerWidth() / 2479,
      speed: 1,
      notationWidth: 2479,
      notationHeight: 3508
    });

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

  $.getScript('./' + $.queryString('notation') + '/data.js').then(function() {
    $audio[0].src = audioUrl;
    notation.init({
      sections: sections,
      notes: notes,
      times: times,
      images: images,
      audioUrl: audioUrl,
      videoUrl: videoUrl
    });
  });

  ko.applyBindings(notation);

  $audio.on('play', function() {
    window.cursor.start($audio[0].currentTime, 1);
  });

  $audio.on('pause', function() {
    window.cursor.stop($audio[0].currentTime, 1);
  });

  $audio.on('timeupdate', function() {
    notation.currentTime($audio[0].currentTime);
  });
});
