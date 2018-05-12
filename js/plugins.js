(function() {
  ko.bindingHandlers.cursor = {
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var info = ko.unwrap(valueAccessor()),
        currentTime = info.currentTime,
        speed = info.speed,
        playing = info.playing,
        sequences = allBindings.get('sequences')(),
        $element = $(element),
        startSection,
        startNote;

      if (!playing) {
        return $element.stop();
      }

      $.each(sequences, function(indexSection, section) {
        var notes = section.notes(),
          found = false;

        $.each(notes, function(indexNote, note) {
          if (note.time > currentTime) {
            startSection = indexSection;
            startNote = indexNote;
            found = true;
            return false;
          }
        });

        if (found) {
          return false;
        }
      });

      if (startSection !== undefined && startNote !== undefined) {
        moveNext(startSection, startNote);
      }

      function moveNext(indexSection, indexNote) {
        var section = sequences[indexSection],
          notes = section.notes(),
          note = notes[indexNote];

        console.log(note.time - currentTime);

        $element = $element.stop().animate({
          'left': note.left(),
          'top': note.top(),
          'height': note.height()
        }, (note.time - currentTime) * 1000 * speed - 1, 'linear', function() {
          currentTime = note.time;

          if (notes[indexNote + 1]) {
            moveNext(indexSection, indexNote + 1);
          } else {
            $element = $element.stop().animate({
              'left': parseFloat(section.left()) + parseFloat(section.width()) + 'px',
              'top': section.top(),
              'height': section.height()
            }, (section.endTime - currentTime) * 1000 * speed, 'linear', function() {
              currentTime = section.endTime;

              if (sequences[indexSection + 1]) {
                moveNext(indexSection + 1, 0);
              }
            });
          }
        });
      }
    }
  };

  var CursorViewModel = function(params) {
    var self = this;

    self.isShow = params.isShow;
    self.sequences = params.sequences;
    self.cursor = params.cursor;
  };

  ko.components.register('notation-cursor', {
    viewModel: CursorViewModel,
    template: '<!-- ko if: isShow -->' +
    '<div class="cursor-note" data-bind="cursor: cursor, sequences: sequences"></div>' +
    '<!-- /ko -->'
  });

  var cursor = function() {
    var self = this;

    self.cursor = ko.observable({
      currentTime: 0,
      speed: 1,
      playing: false
    });

    self.start = function(currentTime, speed) {
      self.cursor({
        currentTime: currentTime,
        speed: speed,
        playing: true
      });
    };

    self.stop = function(currentTime, speed) {
      self.cursor({
        currentTime: currentTime,
        speed: speed,
        playing: false
      });
    };
  };

  window.cursor = new cursor(); // global object for broadcaster
}());
