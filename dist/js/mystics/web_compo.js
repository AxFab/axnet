
(function () {
  var root = this

  var WC = {}

  WC.objGet = function(data, name) {
    var names = name.split('.');
    for (var i =0; i < names.length; ++i) {
      data = data[names[i]]
      if (!data)
        return data;
    }
    return data;
  }

  WC.objSet = function(data, name, item) {
    var names = name.split('.');
    for (var i =0; i < names.length - 1; ++i)
      data = data[names[i]]
    data[names[names.length - 1]] = item
  }


  WC.buildTable = function(header, array) {
    var xHtml = '<thead><tr>';
    for (var i =0; i < header.length; ++i)
      xHtml += '<th>' + header[i].name + '</th>'
    xHtml += '</tr></thead>'
    xHtml += '<tbody><tr>'
    for (var j =0; j < array.length; ++j) {
      if (j != 0)
        xHtml += '</tr><tr>';
      for (var i =0; i < header.length; ++i) {
        var extract = WC.objGet
        if (header[i].extract)
          extract = header[i].extract
        var data = extract(array[j], header[i].data)
        if (header[i].format)
          data = header[i].format(data)
        xHtml += '<td>' + data + '</td>'
      }
    }
    xHtml += '</tr></tbody>'
    return xHtml
  }

  WC.widget = function(panel, data) {
    var text = panel.innerHTML
    var rex = /\{data.([a-zA-Z0-9_.]+)\}/;
    for (;;) {
      var m = rex.exec(text);
      if (!m) 
        break;


      var val = WC.objGet(data, m[1])
      text = m.input.substr(0, m.index) +  val + m.input.substr(m.index + m[0].length)
    }
    panel.innerHTML = text;
    panel.style.display = 'block'
  }


  WC.autofillTable = function (tables) {
    for (var i=0; i < tables.length; ++i) {
      var tbl = tables[i];
      var html = WC.buildTable(tbl.columns, tbl.data);
      var panel = document.getElementById(tbl.name);
      panel.innerHTML = html;
      panel.className = 'table table-condensed table-hover';
    }
  }


  root.WC = WC; 

}).call(this)