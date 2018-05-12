(function() {
  ko.bindingHandlers.cursor = {
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var info = ko.unwrap(valueAccessor()),
        currentTime = info.currentTime,
        speed = info.speed,
        sections = allBindings.get('sections')(),
        $element = $(element),
        startSection,
        startNote;

      $element.css({
        'left': sections[0].left(),
        'top': sections[0].top(),
        'height': sections[0].height()
      });

      $.each(sections, function(indexSection, section) {
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
        var section = sections[indexSection],
          notes = section.notes(),
          note = notes[indexNote];

        console.log(note.time - currentTime);
        $element = $element.animate({
          'left': note.left(),
          'top': note.top(),
          'height': note.height()
        }, (note.time - currentTime) * 1000 * speed, function() {
          currentTime = note.time;

          if (notes[indexNote + 1]) {
            moveNext(indexSection, indexNote + 1);
          } else {
            $element = $element.animate({
              'left': parseFloat(section.left()) + parseFloat(section.width()) + 'px',
              'top': section.top(),
              'height': section.height()
            }, (section.endTime - currentTime) * 1000 * speed, function() {
              currentTime = section.endTime;

              if (sections[indexSection + 1]) {
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
    self.sections = params.sections;
    self.cursor = params.cursor;
  };

  ko.components.register('notation-cursor', {
    viewModel: CursorViewModel,
    template: '<!-- ko if: isShow -->' +
    '<div class="cursor-note" data-bind="cursor: cursor, sections: sections"></div>' +
    '<!-- /ko -->'
  });

  var cursor = function() {
    var self = this;

    self.cursor = ko.observable({
      currentTime: 0,
      speed: 1
    });

    self.jump = function(currentTime, speed) {
      self.cursor({
        currentTime: currentTime,
        speed: speed
      });
    };
  };

  window.cursor = new cursor(); // global object for broadcaster
}());
