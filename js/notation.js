var Notation = (function() {
  function Notation(options) {
    var self = this,
      defaultOptions = {
        scale: 1
      };

    self.options = $.extend({}, defaultOptions, options);
    //乐谱标题
    self.title = ko.observable(self.options.title);
    //乐谱页
    self.pages = ko.observableArray();
    //当前时间
    self.currentTime = ko.observable(0);
    //播放速度
    self.speed = ko.observable(1);
    //是否显示小节滑块
    self.showSectionCursor = ko.observable(false);
    //是否显示音符光标
    self.showNoteCursor = ko.observable(true);
    //当前播放的页码
    self.currentPageIndex = ko.observable();
    //当前播放的小节
    self.currentSectionIndex = ko.observable();
    //乐谱整体高度
    self.notationHeight = ko.observable((self.options.sum * self.options.height * self.options.scale) + 'px');
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
      sequences = [],
      pages = [];

    for (var i = 0; i < self.options.sum; i++) {
      self.images.push(i + 1);
    }

    if (sections && sections.length) {
      $.each(sections, function(sectionIndex, sectionItem) {
        var width = (sectionItem[1].eX - sectionItem[1].x) * self.options.scale,
          height = (sectionItem[1].eY - sectionItem[1].y) * self.options.scale,
          left = sectionItem[1].x * self.options.scale,
          id = sectionItem[0][0],
          page = sectionItem[0][1],
          top = sectionItem[1].y * self.options.scale;

        sections['section' + id] = {
          id: id,
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
        var sectionId = parseInt(noteItem[0][0].toString().split('.')[0]),
          sectionKey = 'section' + sectionId,
          height = (noteItem[1].eY - noteItem[1].y) * self.options.scale,
          left = noteItem[1].x * self.options.scale,
          id = noteItem[0][0],
          page = noteItem[0][1],
          top = noteItem[1].y * self.options.scale;

        notes['note' + id] = {
          id: id,
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
          sectionId: sectionId,
          sectionKey: sectionKey
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

        var note = $.extend(true, {}, notes['note' + timeItem[1]], {time: timeItem[0]});

        if (!section) {
          section = $.extend(true, {}, sections[note.sectionKey], {
            notes: [note],
            startTime: note.time
          });
          sequences.push(section);
          return;
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

          section = $.extend(true, {}, sections[note.sectionKey], {
            notes: [note],
            startTime: note.time
          });

          sequences.push(section);
        }
      });
    }

    $.each(sequences, function(index, item) {
      var prePage = pages[pages.length - 1];

      //小节播放序号
      item.index = index;

      if (prePage && prePage.id === item.page) {
        prePage.notes = prePage.notes.concat(item.notes);
        prePage.sections.push(item);
      } else {
        pages.push({
          id: item.page,
          cursorStyle: {
            width: item.notes[0].width + 'px',
            height: item.notes[0].height + 'px',
            left: item.notes[0].left + 'px',
            top: item.notes[0].top + 'px'
          },
          style: {
            top: ((item.page - 1) * self.options.height * self.options.scale) + 'px',
            height: (self.options.height * self.options.scale) + 'px',
            'background-image': 'url(./data/' + self.options.title + '/img/' + item.page + '.png)'
          },
          notes: [].concat(item.notes),
          sections: [item]
        });
      }
    });

    $.each(pages, function(i, page) {
      var sections = page.sections;

      page.startTime = sections[0].startTime;
      page.endTime = sections[sections.length - 1].endTime;
    });

    self.pages(pages);

    ko.computed(function() {
      var currentTime = self.currentTime();

      $.each(pages, function(indexPage, page) {
        if (page.startTime < currentTime && page.endTime > currentTime) {
          self.currentPageIndex(indexPage);
        }

        $.each(page.sections, function(indexSection, section) {
          if (section.startTime < currentTime && section.endTime > currentTime) {
            self.currentSectionIndex(section.index);
          }
        });
      });
    });
  };

  return Notation;
}());
