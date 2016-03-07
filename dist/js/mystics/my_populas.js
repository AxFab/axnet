
(function () {
  var root = this;

  var randInt = function(max) {
    var rd = Math.floor(Math.random() * 65536);
    return rd % max;
  }


  var MysticGroup = function(ref, model) {
    this.ref = ref;
    this.model = model;
    this.count = 0;
    this.used = 0;
    this.trained = 0;

    this.__defineGetter__("max", function () { return this.ref.max; });
    this.__defineGetter__("avail", function () { 
      return this.count - this.used; 
    });
    this.__defineGetter__("miss", function () { 
      return this.max - this.count - this.trained; 
    });
  }

  // Define getter for max
  MysticGroup.prototype.getMax = function () {
    return this.ref.max;
  }


  var MysticPopulas = function() {
    this.units = [];
    this.__defineGetter__("used", function() { return this.sum('used'); });
    this.__defineGetter__("avail", function() { return this.sum('avail'); });
    this.__defineGetter__("trained", function() { return this.sum('trained'); });
    this.__defineGetter__("max", function() { return this.sum('max'); });
    this.__defineGetter__("miss", function() { return this.sum('miss'); });
    this.__defineGetter__("count", function() { return this.sum('count'); });
  }

  // Define getter for used
  MysticPopulas.prototype.sum = function (name) {
    var cnt = 0;
    for (var i=0; i < this.units.length; ++i)
      cnt += this.units[i][name];
    return cnt;
  }

  // Add a new group to this populas
  MysticPopulas.prototype.add = function (grp) {
    if (!(grp instanceof MysticGroup))
      throw new Error('Invalid argument');
    this.units.push(grp);
  }


  // Add a number of unit randomly
  MysticPopulas.prototype.randomFill = function (seeker) {

    while (seeker >= 1) {
      seeker--;
      for (;;) {
        var grp = this.units[randInt(this.units.length)];
        if (grp.count >= grp.max)
          continue;
        grp.count++;
        break;
      }
    }
  }

  MysticPopulas.prototype.transform = function (name, seeker) {

    while (seeker >= 1) {
      seeker--;
      for (var i = 0; i <50; ++i) {
        var grp = this.units[randInt(this.units.length)];
        if (grp.avail <= 0 || grp.ref.model !== name)
          continue;
        grp.used++;
        return true;
      }
      return false;
    }
  }

  MysticPopulas.prototype.unused = function (name, seeker) {
    while (seeker >= 1) {
      seeker--;
      for (var i = 0; i <50; ++i) {
        var grp = this.units[randInt(this.units.length)];
        if (grp.used <= 0 || grp.ref.model !== name)
          continue;
        grp.used--;
        return true;
      }
      return false;
    }
  }






  root.MysticPopulas = MysticPopulas; 
  root.MysticGroup = MysticGroup; 

}).call(this);
