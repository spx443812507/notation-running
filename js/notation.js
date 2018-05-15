var Note = (function() {
  function Note(note) {
    this.sectionId = undefined;
    this.id = undefined;
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

    self.sectionId = note.sectionId;
    self.id = note.id;
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
        scale: 1
      };

    self.options = $.extend({}, defaultOptions, options);
    //乐谱标题
    self.title = ko.observable(self.options.title);
    //音符列表
    self.notes = ko.observableArray();
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

    if (sections && sections.length) {
      $.each(sections, function(sectionIndex, sectionItem) {
        var width = (sectionItem[1].eX - sectionItem[1].x) * self.options.scale,
          height = (sectionItem[1].eY - sectionItem[1].y) * self.options.scale,
          left = sectionItem[1].x * self.options.scale,
          id = sectionItem[0][0],
          page = sectionItem[0][1],
          top = (sectionItem[1].y + ((page - 1) * self.options.height)) * self.options.scale;

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
    }

    if (notes && notes.length) {
      $.each(notes, function(noteIndex, noteItem) {
        var sectionId = parseInt(noteItem[0][0].toString().split('.')[0]),
          sectionKey = 'section' + sectionId,
          height = (noteItem[1].eY - noteItem[1].y) * self.options.scale,
          left = noteItem[1].x * self.options.scale,
          id = noteItem[0][0],
          page = noteItem[0][1],
          top = (noteItem[1].y + ((page - 1) * self.options.height)) * self.options.scale;

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

          if (preSectionLastNote.sectionId !== note.sectionId) {
            section.notes.push({
              id: 'endLine_' + section.id,
              page: section.page,
              width: 2,
              height: section.height,
              left: section.left + section.width,
              top: section.top,
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
      var section = new Section(item),
        page = pages[section.page - 1];

      $.each(section.notes(), function(i, note) {
        self.notes.push(note);
      });

      if (page && page.length) {
        page.push(section);
      } else {
        pages.push([section]);
      }
    });

    self.pages(pages);

    ko.computed(function() {
      var currentTime = self.currentTime(),
        pages = self.pages();

      $.each(pages, function(indexPage, page) {

        $.each(page, function(indexSection, section) {
          section.isActive(false);

          if (section.startTime < currentTime && section.endTime > currentTime) {
            section.isActive(true);
          }
        });
      });
    });
  };

  Notation.prototype.changeSection = function(section) {
  };

  return Notation;
}());
