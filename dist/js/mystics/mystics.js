
(function () {
  var root = this;

  var Mystics = function () {
  };

  Mystics.newStock = function (cnt) {
    if (!cnt)
      cnt = 0;
    return {
      cereals: cnt,
      gold: cnt,
      wood: cnt,
      rock: cnt,
    };
  };



  root.Mystics = Mystics; 

}).call(this);
