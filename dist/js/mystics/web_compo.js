
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

  root.WC = WC; 

}).call(this)