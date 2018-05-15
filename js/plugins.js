(function() {
  ko.bindingHandlers.cursor = {
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var info = ko.unwrap(valueAccessor()),
        currentTime = info.currentTime,
        speed = info.speed,
        playing = info.playing,
        notes = allBindings.get('notes')(),
        $element = $(element),
        noteIndex;

      if (!playing) {
        return $element.stop();
      }

      $.each(notes, function(index, note) {
        if (note.time > currentTime) {
          noteIndex = index;
          return false;
        }
      });

      if (noteIndex !== undefined) {
        moveNext(noteIndex);
      }

      function moveNext(noteIndex) {
        var note = notes[noteIndex],
          nextNote;

        $element = $element.stop().animate(note.style(),
          (note.time - currentTime) * 1000 * speed - 1, 'linear', function() {
            currentTime = note.time;

            if (notes[noteIndex + 1]) {
              nextNote = notes[noteIndex + 1];

              if (note.sectionId !== nextNote.sectionId) {
                $element.css(nextNote.style());
              }

              moveNext(noteIndex + 1);
            }
          });
      }
    }
  };

  var CursorViewModel = function(params) {
    var self = this;

    self.isShow = params.isShow;
    self.notes = params.notes;
    self.cursor = params.cursor;
    self.style = params.style;
  };

  ko.components.register('notation-cursor', {
    viewModel: CursorViewModel,
    template: '<!-- ko if: isShow -->' +
    '<div class="cursor-note" data-bind="cursor: cursor, notes: notes, style: style"></div>' +
    '<!-- /ko -->'
  });

  var cursor = function() {
    var self = this;

    self.cursor = ko.observable({
      currentTime: 0,
      speed: 1,
      playing: false
    });

    self.set = function(playing, currentTime, speed) {
      self.cursor({
        currentTime: currentTime,
        speed: speed,
        playing: playing
      });
    };
  };

  window.cursor = new cursor(); // global object for broadcaster
}());
