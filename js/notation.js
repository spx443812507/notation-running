var Note = (function() {
  function Note(note) {
    this.id = ko.observable();
    this.page = ko.observable();
    this.width = ko.observable();
    this.height = ko.observable();
    this.left = ko.observable();
    this.top = ko.observable();
    this.time = undefined;

    if (note) {
      this.init(note);
    }
  }

  Note.prototype.init = function(note) {
    var self = this;

    self.id(note.id);
    self.page(note.page);
    self.width(note.width + 'px');
    self.height(note.height + 'px');
    self.left(note.left + 'px');
    self.top(note.top + 'px');
    self.time = note.time;
  };

  return Note;
}());

var Section = (function() {
  function Section(section) {
    this.id = undefined;
    this.page = undefined;
    this.width = ko.observable();
    this.height = ko.observable();
    this.left = ko.observable();
    this.top = ko.observable();
    this.startTime = undefined;
    this.endTime = undefined;
    this.isActive = ko.observable(false);
    this.notes = ko.observableArray();

    if (section) {
      this.init(section);
    }
  }

  Section.prototype.init = function(section) {
    var self = this;

    self.id = section.id;
    self.page = section.page;
    self.width(section.width + 'px');
    self.height(section.height + 'px');
    self.left(section.left + 'px');
    self.top(section.top + 'px');
    self.startTime = section.startTime;
    self.endTime = section.endTime;

    if (section.notes && section.notes.length) {
      $.each(section.notes, function(i, item) {
        self.notes.push(new Note(item));
      });
    }
  };

  return Section;
}());

var Notation = (function() {
  function Notation(options) {
    var self = this,
      defaultOptions = {
        scale: 1,
        notationWidth: 100,
        notationHeight: 100
      };

    self.options = $.extend({}, defaultOptions, options);
    //小节列表
    self.sequences = ko.observableArray();
    //当前时间
    self.currentTime = ko.observable(0);
    //播放速度
    self.speed = ko.observable(1);
    //是否显示小节滑块
    self.showSectionCursor = ko.observable(false);
    //是否显示音符光标
    self.showNoteCursor = ko.observable(true);
    //页面高度
    self.pageHeight = ko.observable(0);
    //乐谱页
    self.pages = ko.observableArray();
  }

  Notation.prototype.init = function(data) {
    var self = this,
      sections = {},
      notes = {},
      sequences = [],
      pageCount;

    if (data && data.sections && data.sections.length) {
      $.each(data.sections, function(sectionIndex, sectionItem) {
        var width = (sectionItem[1].eX - sectionItem[1].x) * self.options.scale,
          height = (sectionItem[1].eY - sectionItem[1].y) * self.options.scale,
          left = sectionItem[1].x * self.options.scale,
          id = sectionItem[0][0],
          page = sectionItem[0][1],
          top = (sectionItem[1].y + ((page - 1) * self.options.notationHeight)) * self.options.scale;

        sections['section' + id] = {
          id: id,
          page: page,
          width: width,
          height: height,
          left: left,
          top: top,
          notes: []
        };
      });

      //获取乐谱页数
      pageCount = data.sections[data.sections.length - 1][0][1];
      //根据页数设置页面高度
      self.pageHeight((self.options.notationHeight * pageCount) * self.options.scale + 'px');

      for (var i = 0; i < pageCount; i++) {
        self.pages.push(i + 1);
      }
    }

    if (data && data.notes && data.notes.length) {
      $.each(data.notes, function(noteIndex, noteItem) {
        var sectionId = parseInt(noteItem[0][0].toString().split('.')[0]),
          sectionKey = 'section' + sectionId,
          height = (noteItem[1].eY - noteItem[1].y) * self.options.scale,
          left = noteItem[1].x * self.options.scale,
          id = noteItem[0][0],
          page = noteItem[0][1],
          top = (noteItem[1].y + ((page - 1) * self.options.notationHeight)) * self.options.scale;

        notes['note' + id] = {
          id: id,
          page: page,
          width: 2,
          height: height,
          left: left,
          top: top,
          sectionId: sectionId,
          sectionKey: sectionKey
        };
      });
    }

    if (data && data.times && data.times.length) {
      var section;

      $.each(data.times, function(timeIndex, timeItem) {
        if (timeItem[1] === 'end') {
          return;
        }

        var note = $.extend(true, {}, notes['note' + timeItem[1]], {time: timeItem[0]});

        if (section && section.id === note.sectionId) {
          section.notes.push(note);
        } else {
          section = $.extend(true, {}, sections[note.sectionKey], {
            notes: [note]
          });
          sequences.push(section);
        }
      });
    }

    $.each(sequences, function(index, section) {
      var nextSection = sequences[index + 1];

      //将第一个音符的时间设置为小节起始时间
      if (section.notes && section.notes.length) {
        section.startTime = section.notes[0].time;
      }

      // 如果后面有小节，取后面小节的第一个音符事件为本小节的结束时间，否则取'end'时间
      if (nextSection) {
        if (nextSection.notes && nextSection.notes.length) {
          section.endTime = nextSection.notes[0].time;
        }
      } else {
        var endingTime = times[times.length - 1];

        section.notes.push({
          id: endingTime[1],
          time: endingTime[0],
          page: section.page,
          width: 2,
          top: section.top,
          left: section.left + section.width,
          height: section.height
        });

        section.endTime = endingTime[0];
      }

      self.sequences.push(new Section(section));
    });

    ko.computed(function() {
      var currentTime = self.currentTime(),
        sequences = self.sequences();

      $.each(sequences, function(i, section) {
        section.isActive(false);

        if (section.startTime < currentTime && section.endTime > currentTime) {
          section.isActive(true);
        }
      });
    });
  };

  Notation.prototype.changeSection = function(section) {
  };

  return Notation;
}());
