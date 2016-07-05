#!/usr/bin/env node
"use strict";
(function () {
  var root = this;

  var fs = require('fs'),
      Pdf = require('pdfkit'),
      jaks = require('./jaks');

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  var Canvas = function (doc, dx, dy, scale) {
    this.doc = doc;
    this.canvas = {};
    this.scale = scale || 1.8;
    this._x = function (x) { return dx + x / this.scale; }
    this._y = function (y) { return dy + y / this.scale; }
    Object.defineProperty(this,'fillStyle', { 
      get:function() { 
        return this._fillStyle; 
      },
      set:function(value) { 
        doc.fillColor(value);
        this._fillStyle = value;
      },
    });
    Object.defineProperty(this,'lineWidth', { 
      get:function() {
        return this._lineWidth;
      },
      set:function(value) {
        doc.lineWidth(value / this.scale);
        this._lineWidth = value;
      },
    });
    Object.defineProperty(this,'strokeStyle', { 
      get:function() {
         return this._strokeStyle;
      },
      set:function(value) {
         doc.strokeColor(value);
         this._strokeStyle = value;
      },
    });
  }

  Canvas.prototype.clearRect = function (x, y, width, height) {
  };
  
  Canvas.prototype.rect = function (x, y, width, height) { 
    if(width < 100) 
      this.doc.rect(this._x(x), this._y(y), width/this.scale, height/this.scale);
  };

  Canvas.prototype.save = function () { 
    this.doc.save() 
  };

  Canvas.prototype.beginPath = function () { 
    this.doc.save();
  };

  Canvas.prototype.clip = function () {  
  };

  Canvas.prototype.measureText = function (tx) {
    return { width:30 }
  };

  Canvas.prototype.moveTo = function (x, y) { 
    this.doc.moveTo(this._x(x), this._y(y)) 
  };

  Canvas.prototype.lineTo = function (x, y) { 
    this.doc.lineTo(this._x(x), this._y(y)) 
  };

  Canvas.prototype.stroke = function () { 
    this.doc.stroke() 
  };

  Canvas.prototype.fill = function () { 
    this.doc.fill()
  };

  Canvas.prototype.restore = function () {  
  };

  Canvas.prototype.fillText = function (text, x, y) { 
    var opt = {
      style: 'Regular',
      size: 10,
      color: this.fillStyle,
    };
    this.doc.font('font/OpenSans-'+opt.style+'.ttf');
    this.doc.fontSize(opt.size);
    this.doc.fillColor(opt.color);
    this.doc.text(text, this._x(x), this._y(y)-10);
  };

  Canvas.prototype.fillRect = function (x, y, width, height) { 
    this.doc.rect(this._x(x), this._y(y), width/this.scale, height/this.scale); 
    this.doc.fill();
  };

  Canvas.prototype.arc = function (x, y, radius, a1, a2) { 
    this.doc.circle(this._x(x), this._y(y), radius/this.scale);
  };

  Canvas.get = function(doc, dx, dy, scale) {
    return {
      ctx:new Canvas(doc, dx, dy, scale),
      fontFamily:'OpenSans',
      fontSize:14,
    };
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  var Odax = function () {
    this.doc = new Pdf({
      bufferPages: true,
      layout: 'portrait',
      size: 'a4',
      margin: 28.38,
    });
    this.page = {
      width:595.3, height:841.9,
      margin:28.38
    };
    this.doc.pipe(fs.createWriteStream('output.pdf'));

    this.sections = [];
    this.section = {
      x: this.page.margin,
      y: this.page.margin,
      w: this.page.width - this.page.margin * 2,
      h: this.page.height - this.page.margin * 2,
      c: 12,
      t: this.page.margin,
    };
    this.prev = {
      x: this.page.margin,
      w: this.section.w,
      h: this.section.h,
    };
  };

  Odax.Canvas = Canvas;

  Odax.prototype.pageSection = function() {
  }

  Odax.prototype.writeText = function(text, style) {
    var doc = this.doc,
        sz = this.section,
        lg = style.size * 1.5;

    if (!style.tleft) style.tleft = 0;

    if (style.bg === 'rect') {
      doc.rect(sz.x, sz.y, sz.w, lg);
      doc.fill(style.bgColor);
    } else if (style.bg === 'arrow') {
      doc.moveTo(sz.x, sz.y);
      doc.lineTo(sz.x + 150, sz.y);
      doc.lineTo(sz.x + 162, sz.y + lg/2);
      doc.lineTo(sz.x + 150, sz.y + lg);
      doc.lineTo(sz.x, sz.y + lg);
      doc.fill(style.bgColor);
    }

    doc.font('font/OpenSans-'+style.style+'.ttf');
    doc.fontSize(style.size);
    doc.fillColor(style.color);
    doc.text(text, sz.x + 5 + style.tleft, sz.y, {
      width: sz.w - style.tleft,
    });

    if (style.brStyle !== undefined) {
      doc.save();
      doc.moveTo(sz.x, sz.y + lg);
      doc.lineTo(sz.x + sz.w, sz.y + lg);
      if (style.brStyle === 'solid') {
        doc.undash();
      } else if (style.brStyle === 'dashed') {
        doc.dash(5, {space:5});
      }
      doc.strokeColor(style.brColor)
      doc.strokeOpacity(1)
      doc.lineWidth(style.brWidth);
      doc.stroke();
    }

    if (style.tleft === 0) {
      this.section.y += lg * style.eolSp;
    }
  }

  Odax.prototype.openWell = function() {
    var doc = this.doc,
        sz = this.section;
    this.well = {
      x: sz.x,
      y: sz.y,
      w: sz.w,
    }

    this.section.x += 10;
    this.section.w -= 20;
    this.prev.w -= 20;
    this.prev.x += 10;
  }

  Odax.prototype.closeWell = function() {
    var doc = this.doc;
    var r = 10, s = 0.707 * r;
    var sz = {
      x: this.well.x,
      w: this.well.w,
      y: this.well.y,
      h: this.section.y - this.well.y,
    }

    this.prev = {
      x: this.page.margin,
      w: this.page.width - this.page.margin * 2,
      h: this.page.height - this.page.margin * 2,
    }

    this.section.y += 12;

    doc.save();
    doc.moveTo(sz.x, sz.y);
    doc.lineTo(sz.x, sz.y + sz.h - r);
    doc.quadraticCurveTo(sz.x + (r - s), sz.y + sz.h + s - r, sz.x + r, sz.y + sz.h);
    doc.lineTo(sz.x + sz.w - r, sz.y + sz.h)
    doc.quadraticCurveTo(sz.x + sz.w -r + s, sz.y + sz.h - r + s, sz.x + sz.w, sz.y + sz.h - r)
    doc.lineTo(sz.x + sz.w, sz.y)
    doc.undash();
    doc.strokeColor('#000000')
    doc.strokeOpacity(0.1)
    doc.lineWidth(2);
    doc.stroke();
  }

  Odax.prototype.openRow = function() {
    this.sections.push(this.section)
    this.openColumn(12);
  }

  Odax.prototype.closeRow = function() {
    this.section = this.sections.pop();
  }

  Odax.prototype.openColumn = function(sz) {
    var mrg = 20, cols = 12;
    var o = this.section.c + sz > cols ? 0 : this.section.c,
        w = this.prev.w,// - this.page.margin * 2,
        h = this.prev.h,// - this.page.margin * 2,
        c = (w - mrg * (cols - 1)) / cols,
        t = this.section.c + sz > cols ? this.section.y : this.section.t;

    // console.log('section', this.section);
    // console.log('Column', o, w, h, c, t);
    this.section = {
      x: this.prev.x + (c + mrg) * o,
      y: t,
      w: sz * c +  (sz - 1) * mrg,
      h: h,
      c: o + sz,
      t: t,
    };
  }

  Odax.prototype.close = function() {
    this.doc.end()
  }


  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  module.exports = Odax
    
}).call(this);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var Odax = module.exports;
var doc = new Odax();
var style = {};

style.h1 = {
  style: 'Light', size: 18, color: '#ffffff', bg:'rect', bgColor: '#101064', eolSp:1.5 };
style.h2 = {
  style: 'LightItalic', size: 16, color: '#ffffff', bg:'arrow', bgColor: '#a6a6a6', eolSp:1.0 };
style.h3 = {
  style: 'Regular', size: 14, color: '#a6a6a6', eolSp:1.15, brWidth:1, brStyle:'dashed', brColor:'#a6a6a6' };
style.bg = {
  style: 'Semibold', size: 32, color: '#181818', eolSp:1.15 };
style.lgd = {
  style: 'Regular', size: 9, color: '#181818', eolSp:1.15, tleft:45 };
style.bd = {
  style: 'Regular', size: 0, color: '#181818', eolSp:1.15, brWidth:1, brStyle:'dashed', brColor:'#a6a6a6' };
style.un = {
  style: 'Regular', size: 13, color: '#a6a6a6', eolSp:1.5 };

style.green = {
  style: 'Regular', size: 10, color: '#10a610', eolSp:1.0 };
style.red = {
  style: 'Regular', size: 10, color: '#a61010', eolSp:1.0 };


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

var sprint = {
  "no": 9,
  "team": "Bravo",
  "commited": 67,
  "completed": 58,
  "total": 68,
  "capacity": 42,
  "times": [0, 16, 12, 12, 16, 8, 16, 12, 12, 16, 8],
  "burndown": [67, 63, 58, 48, 31, 27],
  "stories": [
    { "no": 5123, "lbl":"Create a new control.", "done":false },
    { "no": 6713, "lbl":"Display a new control.", "done":true },
    { "no": 4681, "lbl":"Create this awesome feature.", "done":false }
  ]
};

var enrichSprint = function(sprint) {

  sprint.burndownChart = [
    ['', 'Target', 'Actual'],
  ];

  sprint.capacity = 0;
  for (var i=0; i<sprint.times.length; ++i) {
    sprint.capacity += sprint.times[i];
  }
  sprint.pace_initial = sprint.capacity / sprint.commited;
  sprint.pace_final = sprint.capacity / sprint.completed;
  sprint.speed = sprint.completed / sprint.capacity * 8;
  sprint.extra = Math.max(0, sprint.total - sprint.commited);
  sprint.fails = Math.max(0, sprint.total - sprint.completed);
  sprint.extra_time = sprint.extra * sprint.pace_final;

  // Create Burndown chart
  var bdown = 0
  for (var i=0; i<sprint.times.length; ++i) {
    bdown += sprint.times[i]
    var estim = bdown / sprint.pace_initial;
    sprint.burndownChart[i+1] = [i, sprint.commited - estim, sprint.burndown[i] ? sprint.burndown[i] : null];
  }
}(sprint);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

console.log(sprint)

doc.pageSection();
doc.writeText('Sprint '+sprint.no+' Overview', style.h1);

doc.writeText('The Stats', style.h2);
doc.openWell();

doc.openColumn(4);
doc.writeText('Commited', style.h3)
doc.writeText('Estimate to '+sprint.capacity+' hours of work with a pace of '+sprint.pace_initial.toFixed(2)+' hours per points.', style.lgd)
doc.writeText(sprint.commited, style.bg)
doc.writeText('', style.bd)
doc.writeText('points', style.un)


doc.openColumn(4);
doc.writeText('Delivered', style.h3)
doc.writeText('With a pace of '+sprint.pace_final.toFixed(2)+' hours by points. Velocity: '+sprint.speed.toFixed(2)+' (pts/MD).', style.lgd)
doc.writeText(sprint.completed, style.bg)
doc.writeText('', style.bd)
doc.writeText('points', style.un)


doc.openColumn(4);
doc.writeText('Capacity', style.h3)
style.lgd.tleft = 60
doc.writeText('The capacity of our team for this sprint. '+(sprint.capacity/8).toFixed(0)+' MD (8h a day).', style.lgd)
style.lgd.tleft = 45
doc.writeText(sprint.capacity, style.bg)
doc.writeText('', style.bd)
doc.writeText('hours', style.un)

doc.closeWell();

var saveY = doc.section.y;
doc.openRow();

doc.openColumn(6);
style.h2.bgColor = '#1010a6';
doc.writeText('Stories Achieved', style.h2);
doc.openWell();
doc.writeText('', style.green)
for (var i=0; i<sprint.stories.length; ++i) {
  if (sprint.stories[i].done === true)
  doc.writeText(sprint.stories[i].no + ' - '+ sprint.stories[i].lbl, style.green)
}
doc.closeWell();
var saveY2 = doc.section.y;
doc.openColumn(6);

doc.openColumn(6);
doc.section.y = saveY2;
style.h2.bgColor = '#1010a6';
doc.writeText('Stories Not Achieved', style.h2);
doc.openWell();
doc.writeText('', style.red)
for (var i=0; i<sprint.stories.length; ++i) {
  if (sprint.stories[i].done !== true)
  doc.writeText(sprint.stories[i].no + ' - '+ sprint.stories[i].lbl, style.red)
}
doc.closeWell();
doc.openColumn(6);


doc.section.y = saveY;

doc.openColumn(6);
doc.openColumn(6);
style.h2.bgColor = '#10a6a6';
doc.writeText('The Burndown', style.h2);
doc.openWell();
var ctx1 = Odax.Canvas.get(doc.doc, doc.section.x, doc.section.y + 10, 1.68);
doc.section.y += 130;
doc.closeWell();


doc.openColumn(6);
doc.openColumn(6);
style.h2.bgColor = '#a66410';
doc.writeText('Velocity Charts', style.h2);
doc.openWell();
var ctx2 = Odax.Canvas.get(doc.doc, doc.section.x, doc.section.y + 10, 1.68);
doc.section.y += 130;
doc.closeWell();

var saveY3 = doc.section.y;
doc.closeRow();


doc.section.y = saveY3;
doc.section.x = doc.page.margin
doc.section.w = doc.page.width - doc.page.margin * 2

style.h2.bgColor = '#a61010'
doc.writeText('The Distraction', style.h2);
doc.openWell();

doc.openColumn(3);
doc.writeText('Additional work', style.h3)
doc.writeText('Estimate to '+sprint.extra_time.toFixed(0)+' hours of work on the actual sprint pace.', style.lgd)
doc.writeText(sprint.extra, style.bg)
doc.writeText('', style.bd)
doc.writeText('points', style.un)


doc.openColumn(3);
doc.writeText('Failed to deliver', style.h3)
doc.writeText('Which represent '+(sprint.fails*100/sprint.commited).toFixed(0)+'% of initial commitment.', style.lgd)
doc.writeText(sprint.fails, style.bg)
doc.writeText('', style.bd)
doc.writeText('points', style.un)
var saveY4 = doc.section.y

doc.openColumn(6);
doc.writeText('Retrospective', style.h3)
style.lgd.tleft = 0
doc.writeText('The capacity of our team for this sprint. '+(sprint.capacity/8).toFixed(0)+' MD (8h a day).', style.lgd)


doc.section.y = saveY4;
doc.closeWell();

doc.section.y = doc.page.margin + 6
doc.section.x = doc.page.width - 100

doc.writeText(sprint.team, style.un);


new jaks.Chart(ctx1, sprint.burndownChart, {
  // legendLayout:'north',
  width:400, height:200, padding:{ left:0, top: 0, right:0, bottom: 0},
  grid: {
    x: {},
    y1: {
      min:0,
      mark:'white-circle',
      mark_width:4
    },
  }
});

new jaks.Chart(ctx2, sprint.burndownChart, {
  // legendLayout:'north',
  width:400, height:200, padding:{ left:0, top: 0, right:0, bottom: 0},
  grid: {
    x: {},
    y1: {
      min:0,
      mark:'white-circle',
      mark_width:4
    },
  }
});

// Finalize PDF file
doc.close();

