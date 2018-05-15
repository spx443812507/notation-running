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
    notation = new Notation({
      scale: $('.g-container').innerWidth() / options.width,
      speed: 1,
      title: options.title,
      sections: options.sections,
      notes: options.notes,
      times: options.times,
      width: options.width,
      height: options.height
    });
    $audio[0].src = './data/' + options.title + '/audio.mp3';
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
