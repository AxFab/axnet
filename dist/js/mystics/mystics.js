"use strict";

(function () {
  var root = this;

  var Mystics = function () {
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  Mystics.MAX = 999999999999;

  Mystics.speed = 1/300;

  Mystics.epoch = 0;

  Mystics.resx = {
    cereals:null,
    meat:null,
    fish:null,
    vegetables:null,
    fruits:null,
    wine:null,
    gold:null,
    wood:null,
    rock:null,
    iron:null,
    mercury:null,
    sulfure:null,
    gemmes:null,
    cristals:null,
  };

  Mystics.populous = {
    residents:null,
    workers:null,
    soldiers:null,
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  Mystics.Stock = function (opt) {
    if (!(this instanceof Mystics.Stock))
      return new Mystics.Stock(opt);
    if (!opt)
      opt = {};

    for (var k in Mystics.resx)
      this[k] = opt[k] || 0;
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  Mystics.Model = function (model) {
    if (!(this instanceof Mystics.Model))
      return new Mystics.Model(model);
    if (!model)
      throw new Error("Can't work with `null' model.");

    this.name = model.name;
    this.ico = model.ico;
    this.limit = model.limit || 0;
    this.buildtime = Math.max(model.buildtime, 3);
    this.cost = model.cost || {};
    this.conso = model.conso || {};
    this.capac = model.capac || {};
    this.populas = model.populas || {};
    this.update = model.update || [];
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


  Mystics.Populas = function (model, max) {
    if (!(this instanceof Mystics.Populas))
      return new Mystics.Populas(model, max);
    if (!model || !(model instanceof Mystics.Model))
      throw new Error("Can't work with `null' model.");

    this.model = model;
    this.level = 1;
    this.max = max; // Maximum count reachable
    this.count = 0; // Count formed and operational
    this.training = 0; // Count in training
    this.affected = 0; // Count affected somewhere

    this.__defineGetter__("avail", function () { 
      return this.count - this.affected; 
    });
    this.__defineGetter__("miss", function () { 
      return this.max - this.count - this.training; 
    });
  };

  // Mystics.Populas.prototype.update = function(idx) {
  //   var next = Mystics.getUpModel(Mystics.__.models, this, idx);
  //   this.model = next;
  // };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


  Mystics.Populous = function () {
    if (!(this instanceof Mystics.Populous))
      return new Mystics.Populous();

    this.units = [];

    this.__defineGetter__('max', function () { return this.sum('max'); });
    this.__defineGetter__('count', function () { return this.sum('count'); });
    this.__defineGetter__('training', function () { return this.sum('training'); });
    this.__defineGetter__('affected', function () { return this.sum('affected'); });
    this.__defineGetter__('avail', function () { return this.sum('avail'); });
    this.__defineGetter__('miss', function () { return this.sum('miss'); });
  };

  Mystics.Populous.prototype.sum = function(name) {
    var cnt = 0
    for (var i = 0; i < this.units.length; ++i)
      cnt += this.units[i][name];
    return cnt;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  Mystics.Building = function (model, models) {
    if (!(this instanceof Mystics.Building))
      return new Mystics.Building(model);
    if (!model || !(model instanceof Mystics.Model))
      throw new Error("Can't work with `null' model.");

    this.model = model;
    this.level = 1;
    this.populas = {};
    for (var k in model.populas) {
      this.populas[k] = new Mystics.Populous();
      for (var i=0; i<model.populas[k].length; ++i) {
        var pmod = model.populas[k][i];
        this.populas[k].units.push(new Mystics.Populas(models[pmod.model], pmod.max));
      }
    }
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  

  Mystics.Builder = function () {
  };

  Mystics.Builder.prototype.setCity = function(city) {
    this.city = city;
    this.models = city.models;
    this.catalog = city.catalog;
    this.currents = [];
    this.autoNo = 0;
  };

  Mystics.Builder.prototype.get = function (no, pop) {
    if (no.no && pop !== true)
        return no;
    if (no.no)
      no = no.no;
    for (var i = 0; i < this.currents.length; ++i) 
      if (this.currents[i].no == no) {
        var unit = this.currents[i];
        if (pop === true)
          this.currents.splice(i, 1);
        return unit;
      }
    return null;
  };

  Mystics.Builder.prototype.push = function (model, bld, up, at) {
    if (!model || !bld || !(model instanceof Mystics.Model))
      return 'Model invalid';

    if (bld.count >= bld.limit)
      return 'Already to the max number';

    if (!this.city.canBuy(model.cost))
      return 'Not enough resources';

    this.city.doBuy(model.cost);
    var time = model.buildtime * Math.pow(4, bld.count++);
    var unit = {
      model: model,
      bld: bld,
      at: at,
      buildtime: time,
      ready: Mystics.epoch + time,
      no: ++this.autoNo,
      up: up,
    };
    this.currents.push(unit);
    return true;
  };

  Mystics.Builder.prototype.run = function() {
    var next = Mystics.MAX;
    for (var i=0; i < this.currents.length; ++i) {
        var unit = this.currents[i];
      if (Mystics.epoch >= unit.ready) {
        this.currents.splice(i, 1);
        this.finish(unit)
      } else if (unit.ready < next)
        next = unit.ready;
    }
    return next;
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  Mystics.Archi = function (city) {
    if (!(this instanceof Mystics.Archi))
      return new Mystics.Archi(city);
    this.setCity(city);
  };

  Mystics.Archi.prototype = new Mystics.Builder();

  Mystics.Archi.prototype.cancel = function (no) {
    var unit = this.get(no, true);
    if (!unit)
      return false;
    unit.bld.count--;
  };

  Mystics.Archi.prototype.create = function (name, at) {
    var model = this.models[name];
    var bld = this.catalog[name];
    return this.push(model, bld, false, at);
  };

  Mystics.Archi.prototype.update = function (unit, idx) {
    if (!unit || !(unit instanceof Mystics.Building))
      return false;
    if (!idx)
      idx = 0;
    var model = Mystics.getUpModel(this.models, unit, idx)
    if (!model)
      return false;
    var bld = this.catalog[model.name];
    return this.push(model, bld, unit);
  };

  Mystics.Archi.prototype.finish = function(unit) {
    if (unit.up)
      city.updateBuilding(unit, unit.up);
    else
      city.createBuilding(unit, unit.at);
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  Mystics.Trainer = function (city) {
    if (!(this instanceof Mystics.Trainer))
      return new Mystics.Trainer(city);
    this.setCity(city);
  };

  Mystics.Trainer.prototype = new Mystics.Builder();

  Mystics.Trainer.prototype.cancel = function(unit) {
  };

  Mystics.Trainer.prototype.create = function(unit) {
  };

  Mystics.Trainer.prototype.update = function(unit) {
  };

  Mystics.Trainer.prototype.remove = function(unit) {
  };

  Mystics.Trainer.prototype.finish = function(unit) {
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  Mystics.City = function (opt) {
    if (!(this instanceof Mystics.City))
      return new Mystics.City(opt);
    if (!opt)
      opt = {};

    this.name = opt.name || Mystics.randCityName();
    this.consoUpdate = true;
    this.resx = {
      stock: new Mystics.Stock(opt.stock),
      capac: new Mystics.Stock(opt.capac),
      conso: new Mystics.Stock(),
    };

    this.buildings = [];
    this.populas = {};
    for (var k in Mystics.populous)
      this.populas[k] = new Mystics.Populous();

    this.models = opt.models;
    this.catalog = {};
    for (var k in opt.models) {
      this.models[k] = new Mystics.Model(this.models[k]);
      this.catalog[k] = {
        limit: opt.models[k].limit || 0,
        count: 0,
      };
    }

    this.archi = new Mystics.Archi(this);
    this.trainer = new Mystics.Trainer(this);
    // this.archi.setCity(this);
    // this.trainer.setCity(this);
  };

  Mystics.City.prototype.canBuy = function (cost) {
    for (var k in cost)
      if (this.resx.stock[k] < cost[k])
        return false;
    return true;
  };

  Mystics.City.prototype.doBuy = function (cost) {
    for (var k in cost)
      this.resx.stock[k] -= cost[k];
  };

  Mystics.City.prototype.createBuilding = function (unit, at) {
    var building = new Mystics.Building(unit.model, this.models);
    this.buildings.push(building);

    // Register group on populas objects
    for (var key in building.populas) {
      for (var i=0; i<building.populas[k].units.length; ++i) {
        this.populas[k].units.push(building.populas[k].units[i]);
      }
    }

    // Grow resources capacity
    for (var k in unit.model.capac)
      this.resx.capac[k] += unit.model.capac[k];

    this.consoUpdate = true;
    return true;
  };

  Mystics.City.prototype.updateBuilding = function (unit, building) {
    // Grow resources capacity
    for (var k in unit.model.capac)
      this.resx.capac[k] += unit.model.capac[k] - building.model.capac[k];

    // Register group on populas objects
    for (var key in building.populas) {
      var i=0, grp;
      for (; i<building.populas[k].units.length; ++i) {
        grp = building.populas[k].units[i];
        grp.max = unit.model.populas[k][i].max;
      }
      for (; i<unit.model.populas[k].length; ++i) {
        var pmod = model.populas[k][i];
        grp = new Mystics.Populas(this.models[pmod.model], pmod.max)
        building.populas[k].units.push(grp);
        this.populas[k].units.push(grp);
      }
    }

    this.consoUpdate = true;
    return true;
  };

  Mystics.City.prototype.removeBuilding = function (building) {
    for (var i in this.buildings)
      if (this.buildings[i] === building) {
        this.buildings.splice(i, 1);

        // Register group on populas objects
        for (var key in building.populas) {
          for (var i=0; i<building.populas[k].units.length; ++i) {
            var grp = building.populas[k].units[i];
            grp.count = 0; // TODO reduce them!
            grp.max = 0;
          }
        }

        // Grow resources capacity
        for (var k in building.model.capac)
          this.resx.capac[k] -= building.model.capac[k];

        this.consoUpdate = true;
        return true;
      }
    return false;
  };


  Mystics.City.prototype.updateConso = function () {
    if (!this.consoUpdate)
      return false;
    this.resx.conso = new Mystics.Stock();
    for (var i=0; i < this.buildings.length; ++i) {
      var unit = this.buildings[i];
      for (var key in unit.model.conso) {
        var qty = unit.populas.workers.count * unit.model.conso[key];
        this.conso[key] += qty;
      }
    }

    for (var kp in this.populas) {
      for (var i=0; i < this.populas[kp].units.length; ++i) {
        var grp = this.populas[kp].units[i];
        for (var key in unit.model.conso) {
          var qty = grp.count * grp.model.conso[key];
          this.conso[key] += qty;
        }
      }
    }
    this.consoUpdate = false;
  };

  Mystics.City.prototype.updateStock = function (cost) {
    var elapsed = Mystics.epoch - this.stockUpdate;
    for (var k in this.resx.stock) {
      var qty = this.resx.conso[k] * Mystics.speed * elapsed;
      this.resx.stock[k] -=  qty;
      if (this.resx.stock[k] < 0) {
        console.log ('Penurie', k)
      }

      // Stockage capacity
      this.resx.stock[k] = Math.max(0, Math.min(this.resx.capac[k], this.resx.stock[k]))
    }
    this.stockUpdate = Mystics.epoch;
  };

  Mystics.City.prototype.run = function () {
    this.archi.run();
    this.trainer.run();
    this.updateConso();
    // this.updateStock();
    // Immigration
    // Challenges
  };


  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=



  Mystics.getUpModel = function(models, item, idx) {
    if (!idx)
      idx = 0;
    if (item.model.update.length >= idx)
      return null;
    var key = item.model.update[idx];
    return models[key];
  };

  Mystics.randCityName = function() {
    return 'Zal'; 
  };


  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

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

  Mystics.costString = function (cost) {
    var str = ''
    for (var k in cost) {
      if (str != '')
        str += ', '
      str += k.substr(0, 1).toUpperCase() + k.substr(1).toLowerCase() + ': ' + cost[k]
    }
    return str;
  };


  root.Mystics = Mystics; 

}).call(this);
