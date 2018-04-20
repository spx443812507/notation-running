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

    //整理后的音节信息
    self.notes = [];
    //当前播放的小节
    self.currentSectionId = ko.observable(1);
    //当前时间
    self.currentTime = ko.observable(0);
    //播放速度
    self.speed = ko.observable(1);
    //是否显示小节滑块
    self.showSectionCursor = ko.observable(false);
    //是否显示音符光标
    self.showNoteCursor = ko.observable(true);
    //乐谱页
    self.pages = ko.observableArray();
    //当前页面页码
    self.pageIndex = ko.observable(0);
    //总页数
    self.pageCount = ko.observable(0);

    ko.computed(function() {
      var pageIndex = self.pageIndex(),
        pageCount = self.pageCount();

      if (pageCount > 0 && pageIndex > -1 && pageIndex < pageCount) {
        $.each(self.pages(), function(i, item) {
          item.isShow(pageIndex === i);
        });
      } else if (pageIndex >= pageCount) {
        self.pageIndex(pageCount - 1 > 0 ? pageCount - 1 : 0);
      }
    }, self);
  }

  Notation.prototype.init = function(data) {
    var self = this,
      sections = {};

    if (data && data.sections && data.sections.length) {
      $.each(data.sections, function(sectionIndex, sectionItem) {
        var width = (sectionItem[1].eX - sectionItem[1].x) * self.options.scale,
          height = (sectionItem[1].eY - sectionItem[1].y) * self.options.scale,
          left = sectionItem[1].x * self.options.scale,
          top = sectionItem[1].y * self.options.scale,
          id = sectionItem[0][0],
          page = sectionItem[0][1];

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

    if (data && data.notes && data.notes.length) {
      $.each(data.notes, function(noteIndex, noteItem) {
        var sectionKey = 'section' + noteItem[0][0].toString().split('.')[0],
          height = (noteItem[1].eY - noteItem[1].y) * self.options.scale,
          left = noteItem[1].x * self.options.scale,
          top = noteItem[1].y * self.options.scale,
          id = noteItem[0][0],
          page = noteItem[0][1],
          note = {
            id: id,
            page: page,
            width: 2,
            height: height,
            left: left,
            top: top,
            time: data.times[noteIndex][0]
          };

        if (sections.hasOwnProperty(sectionKey)) {
          sections[sectionKey].notes.push(note);
        }

        self.notes.push(note);
      });
    }

    for (var sectionKey in sections) {
      if (!sections.hasOwnProperty(sectionKey)) {
        return;
      }

      var pages = self.pages(),
        section = new Section(sections[sectionKey]),
        page = section.page,
        nextSectionKey = 'section' + (section.id + 1);

      //将第一个音符的时间设置为小节起始时间
      if (section.notes && section.notes.length) {
        section.startTime = section.notes[0].time;
      }

      // 如果后面有小节，取后面小节的第一个音符事件为本小节的结束时间，否则取'end'时间
      if (sections[nextSectionKey]) {
        if (sections[nextSectionKey].notes && sections[nextSectionKey].notes.length) {
          section.endTime = sections[nextSectionKey].notes[0].time;
        }
      } else {
        section.endTime = times[times.length - 1][1];
      }

      //将小节加入相应分页
      if (pages[page - 1] === undefined) {
        self.pages.push({
          isShow: ko.observable(false),
          sections: ko.observableArray([section])
        });
      } else {
        pages[page - 1].sections.push(section);
      }
    }

    self.pageCount(self.pages().length);
  };

  Notation.prototype.changeSection = function(section) {

  };

  //上一页
  Notation.prototype.goToPrev = function() {
    var self = this, cur = self.pageIndex();

    if (cur > 0) {
      self.pageIndex(cur - 1);
    }
  };
  //下一页
  Notation.prototype.goToNext = function() {
    var self = this, cur = self.pageIndex() + 1;

    if (cur < self.pageCount()) {
      self.pageIndex(cur);
    }
  };

  return Notation;
}());
