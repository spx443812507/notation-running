(function() {
  ko.bindingHandlers.cursor = {
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var info = ko.unwrap(valueAccessor()),
        currentTime = info.currentTime,
        speed = info.speed,
        playing = info.playing,
        page = allBindings.get('page'),
        notes = page.notes,
        $element = $(element),
        noteIndex;

      if (!playing) {
        return $element.stop();
      }

      if (page.startTime < currentTime && page.endTime > currentTime) {
        $.each(notes, function(index, note) {
          if (note.time > currentTime) {
            noteIndex = index;
            return false;
          }
        });

        if (noteIndex !== undefined) {
          var note = notes[noteIndex],
            preNote = notes[noteIndex - 1];

          if (preNote) {
            $element = $element.css({
              width: note.width,
              height: note.height,
              top: note.top,
              left: (currentTime - preNote.time) / (note.time - preNote.time) * (note.left - preNote.left) +
              preNote.left
            });
          }

          moveNext(noteIndex);
        }
      }

      function moveNext(noteIndex) {
        var note = notes[noteIndex],
          nextNote;

        $element = $element.stop().animate(note.style, (note.time - currentTime) * 1000 * speed, 'linear', function() {
          currentTime = note.time;

          if (notes[noteIndex + 1]) {
            nextNote = notes[noteIndex + 1];

            if (note.sectionId !== nextNote.sectionId) {
              $element.css(nextNote.style);
            }

            moveNext(noteIndex + 1);
          }
        });
      }
    }
  };

  var CursorViewModel = function(params) {
    var self = this;

    self.page = params.page;
    self.cursor = params.cursor;
    self.cursorStyle = params.cursorStyle;
  };

  ko.components.register('notation-cursor', {
    viewModel: CursorViewModel,
    template: '<div class="cursor-note" data-bind="cursor: cursor, page: page, style: cursorStyle"></div>'
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
