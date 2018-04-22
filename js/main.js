$(function() {
  var $audio = $('#audio'),
    notation = new Notation({
      scale: $('.g-container').innerWidth() / 2479,
      speed: 1,
      notationWidth: 2479,
      notationHeight: 3508
    });

  notation.init({
    sections: sections,
    notes: notes,
    times: times
  });

  ko.applyBindings(notation);

  $audio.on('timeupdate', function() {
    notation.currentTime($audio[0].currentTime);
  });
});
