(function() {
  ko.bindingHandlers.cursor = {
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var info = ko.unwrap(valueAccessor()),
        currentTime = info.currentTime,
        speed = info.speed,
        notes = allBindings.get('notes'),
        $element = $(element),
        $animate;

      console.log(currentTime);

      $element.css({'left': notes[0].left + 'px', 'top': notes[0].top + 'px', 'height': notes[0].height + 'px'});

      $.each(notes, function(i, note) {

      });
    }
  };

  var CursorViewModel = function(params) {
    var self = this;

    self.isShow = params.isShow;
    self.notes = params.notes;
    self.cursor = params.cursor;
  };

  ko.components.register('notation-cursor', {
    viewModel: CursorViewModel,
    template: '<!-- ko if: isShow -->' +
    '<div class="cursor-note" data-bind="cursor: cursor, notes: notes"></div>' +
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
