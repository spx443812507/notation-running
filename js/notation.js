var Notation = (function() {
  function Notation(options) {
    var self = this,
      defaultOptions = {
        scale: 1
      };

    self.options = $.extend({}, defaultOptions, options);
    //乐谱标题
    self.title = ko.observable();
    //乐谱
    self.notations = ko.observableArray();
    //乐谱拓片
    self.rubbings = ko.observableArray();
    //当前时间
    self.currentTime = ko.observable(0);
    //播放速度
    self.speed = ko.observable(1);
    //当前播放的拓片
    self.currentRubbingIndex = ko.observable();
    //当前播放的小节
    self.currentSectionIndex = ko.observable();
    //乐谱宽度
    self.notationWidth = ko.observable();
    //乐谱高度
    self.notationHeight = ko.observable();
    //乐谱图片
    self.images = ko.observableArray();
    //初始化
    self.init();
  }

  Notation.prototype.init = function() {
    var self = this,
      sections = self.options.sections,
      notes = self.options.notes,
      times = self.options.times,
      sectionMap = {},
      noteMap = {},
      sequences = [],
      rubbings = [],
      notations = [];

    self.title(self.options.title);
    self.notationWidth(Math.ceil((self.options.width * self.options.showNumber * self.options.scale)) + 'px');
    self.notationHeight(Math.ceil((self.options.height * self.options.scale)) + 'px');

    if (sections && sections.length) {
      $.each(sections, function(sectionIndex, sectionItem) {
        var width = (sectionItem[1].eX - sectionItem[1].x) * self.options.scale,
          height = (sectionItem[1].eY - sectionItem[1].y) * self.options.scale,
          left = sectionItem[1].x * self.options.scale,
          sectionId = 'section_' + sectionItem[0][0],
          page = sectionItem[0][1],
          top = sectionItem[1].y * self.options.scale;

        sectionMap[sectionId] = {
          id: sectionId,
          page: page,
          width: width,
          height: height,
          left: left,
          top: top,
          style: {
            width: width + 'px',
            height: height + 'px',
            left: left + 'px',
            top: top + 'px'
          },
          notes: []
        };
      });
    }

    if (notes && notes.length) {
      $.each(notes, function(noteIndex, noteItem) {
        var sectionId = 'section_' + noteItem[0][0].toString().split('.')[0],
          height = (noteItem[1].eY - noteItem[1].y) * self.options.scale,
          left = noteItem[1].x * self.options.scale,
          noteId = 'note_' + noteItem[0][0],
          page = noteItem[0][1],
          top = noteItem[1].y * self.options.scale;

        noteMap[noteId] = {
          id: noteId,
          page: page,
          width: 2,
          height: height,
          left: left,
          top: top,
          style: {
            width: '2px',
            height: height + 'px',
            left: left + 'px',
            top: top + 'px'
          },
          sectionId: sectionId
        };
      });
    }

    if (times && times.length) {
      var section;

      $.each(times, function(timeIndex, timeItem) {
        if (timeItem[1] === 'end') {
          section.endTime = timeItem[0];

          return section.notes.push({
            id: 'end',
            page: section.page,
            width: 2,
            height: section.height,
            left: section.left + section.width,
            top: section.top,
            style: {
              width: '2px',
              height: section.height + 'px',
              left: section.left + section.width + 'px',
              top: section.top + 'px'
            },
            sectionId: section.id,
            time: timeItem[0]
          });
        }

        var note = $.extend(true, {}, noteMap['note_' + timeItem[1]], {time: timeItem[0]});

        if (!section) {
          section = $.extend(true, {}, sectionMap[note.sectionId], {
            notes: [note],
            startTime: 0
          });

          return sequences.push(section);
        }

        if (section.id === note.sectionId) {
          section.notes.push(note);
        } else {
          var preSectionLastNote = section.notes[section.notes.length - 1];

          //添加小节尾线
          if (preSectionLastNote.sectionId !== note.sectionId) {
            section.notes.push({
              id: 'endLine_' + section.id,
              page: section.page,
              width: 2,
              height: section.height,
              left: section.left + section.width,
              top: section.top,
              style: {
                width: '2px',
                height: section.height + 'px',
                left: section.left + section.width + 'px',
                top: section.top + 'px'
              },
              sectionId: section.id,
              time: note.time
            });
          }

          section.endTime = note.time;

          section = $.extend(true, {}, sectionMap[note.sectionId], {
            notes: [note],
            startTime: note.time
          });

          sequences.push(section);
        }
      });
    }

    $.each(sequences, function(index, item) {
      var preRubbing = rubbings[rubbings.length - 1];

      //小节播放序号
      item.index = index;

      if (preRubbing && preRubbing.page === item.page) {
        preRubbing.notes = preRubbing.notes.concat(item.notes);
        preRubbing.sections.push(item);
      } else {
        rubbings.push({
          page: item.page,
          cursorStyle: {
            width: item.notes[0].width + 'px',
            height: item.notes[0].height + 'px',
            left: item.notes[0].left + 'px',
            top: item.notes[0].top + 'px'
          },
          notes: [].concat(item.notes),
          sections: [item]
        });
      }
    });

    for (var i = 0; i < Math.ceil((self.options.sum) / self.options.showNumber); i++) {
      notations[i] = {
        pages: []
      };
      for (var x = 0; x < self.options.showNumber; x++) {
        var page = i * self.options.showNumber + x + 1;

        if (page <= self.options.sum) {
          notations[i].pages.push({
            page: page,
            rubbings: [],
            style: {
              width: (self.options.width * self.options.scale) + 'px',
              'background-image': 'url(./data/' + self.options.title + '/img/' + page + '.png)'
            }
          });
        }
      }
    }

    $.each(rubbings, function(index, rubbing) {
      var sections = rubbing.sections,
        notationNumber = Math.ceil(rubbing.page / self.options.showNumber);

      rubbing.index = index;
      rubbing.notationIndex = notationNumber;
      rubbing.startTime = sections[0].startTime;
      rubbing.endTime = sections[sections.length - 1].endTime;

      $.each(notations[notationNumber - 1].pages, function(i, page) {
        if (page.page === rubbing.page) {
          page.rubbings.push(rubbing);
        }
      });
    });

    self.rubbings(rubbings);
    self.notations(notations);

    ko.computed(function() {
      var currentTime = self.currentTime();

      $.each(rubbings, function(indexRubbing, rubbing) {
        if (rubbing.startTime < currentTime && rubbing.endTime > currentTime) {
          self.currentRubbingIndex(rubbing.index);
        }

        $.each(rubbing.sections, function(indexSection, section) {
          if (section.startTime < currentTime && section.endTime > currentTime) {
            self.currentSectionIndex(section.index);
          }
        });
      });
    });
  };

  return Notation;
}());
