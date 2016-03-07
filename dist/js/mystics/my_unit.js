
(function () {
  var root = this;

  var MysticUnit = function(model) {

    this.model = model;
    this.populas = {
      workers: new MysticPopulas(),
      soldiers: new MysticPopulas(),
      residents: new MysticPopulas(),
    };
  };





  root.MysticUnit = MysticUnit; 

}).call(this);
