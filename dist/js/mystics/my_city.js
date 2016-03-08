
(function () {
  var root = this


  var emptyStock = function (i) {
    return {
      cereals: i,
      gold: i,
      wood: i,
      rock: i,
    };
  };

  var buildSerie = function () {
    return {
      count:0,
    };
  };


  var MysticCity = function(models, goals) {

    this.timer = 0;
    this.allModels = models;
    this.allGoals = goals;
    this.speed = 1 / 250.0;
    this.ticks = 1;

    this.stock = emptyStock(0);
    this.capac = emptyStock(50);
    this.conso = emptyStock(0);
    this.prod = emptyStock(0);

    this.famine = 0;

    this.building = {
      units: [],
    };
    this.trained = {
      units: [],
    };

    this.units = [];
    this.populas = {
      workers: new MysticPopulas(),
      soldiers: new MysticPopulas(),
      residents: new MysticPopulas(),
    };

    this.goals = []
    for (var k in goals.init)
      this.goals.push(goals[goals.init[k]])
  };

  // Add a new builing at the city.
  MysticCity.prototype.addBuilding = function(building) {

    this.units.push(building);
    building.idx = this.units.length;

    // Register group on populas objects
    for (var keyPop in this.populas) {
      if (building.model[keyPop]) {
        for(var k in building.model[keyPop]) {
          var ref = building.model[keyPop][k];
          var grp = new MysticGroup(ref, this.allModels[ref.model]);
          // DEBUG console.log ('GRP', grp.model.name, keyPop);
          this.populas[keyPop].add(grp);
          building.populas[keyPop].add(grp);
          grp.idx = this.populas[keyPop].units.length;
        }
      }
    }

    // Grow resources capacity
    for (var k in building.model.capac) {
      this.capac[k] += building.model.capac[k];
    }
    building.lvl = 1;
  };

  MysticCity.prototype.updateBuilding = function(building, model) {

    // Grow resources capacity
    for (var k in building.model.capac) {
      this.capac[k] += model.capac[k] - building.model.capac[k];
    }

    // Register group on populas objects
    for (var keyPop in this.populas) {
      if (building.model[keyPop]) {
        for (var i = 0; i < building.populas[keyPop].units.length; ++i) {
          var grp = building.populas[keyPop].units[i]
          var oldR = building.model[keyPop][i];
          var newR = model[keyPop][i];
          grp.ref = newR;
        }
      }
    }

    building.model = model;
    building.lvl++;
  }

  MysticCity.prototype.less = function(group, count) {

    if (!group)
      return false;

    var model = group.model;
    if (!model)
      return false;

    var trans = model.from
    if (group.count < count)
      return false;

    var populasOrigin = city.populas[trans.populas];
    if (!populasOrigin.unused(trans.name, count))
      return false;

    group.count -= count;
    return true;
  }


  MysticCity.prototype.update = function(building, idx) {
    if (!(building instanceof MysticUnit) || !building.model.update)
      return false;
    var update = building.model.update[idx]
    var model = this.allModels[update];
    if (!model || model.canBuild === false)
      return false;
    model.id = update

    for (var k in model.cost)
      if (this.stock[k] < model.cost[k])
        return false;

    for (var k in model.cost)
      this.stock[k] -= model.cost[k];

    if (!this.building[update])
      this.building[update] = buildSerie(model);
    var build = this.building[update];
    var unit = new MysticUnit(model);
    unit.prev = building;
    unit.buildTime = model.buildtime * Math.pow(4, build.count++);
    unit.readyAt = this.timer + unit.buildTime;

    this.building.units.push(unit);
    return true;
  }

  MysticCity.prototype.canBuy = function(model) {

    // var model = this.allModels[name];
    if (!model || model.canBuild === false)
      return false;

    model.id = name

    for (var k in model.cost)
      if (this.stock[k] < model.cost[k])
        return false;

    return true;
  }

  MysticCity.prototype.create = function(name) {

    var model = this.allModels[name];
    if (!model || model.canBuild === false || model.isUpdate === true)
      return false;
    model.id = name

    for (var k in model.cost)
      if (this.stock[k] < model.cost[k])
        return false;

    for (var k in model.cost)
      this.stock[k] -= model.cost[k];

    if (!this.building[name])
      this.building[name] = buildSerie(model);
    var build = this.building[name];
    var unit = new MysticUnit(model);

    unit.buildTime = model.buildtime * Math.pow(4, build.count++);
    unit.readyAt = this.timer + unit.buildTime;

    this.building.units.push(unit);
    return true;
  };


  MysticCity.prototype.prepare = function (grpTarget, count) {
    if (!grpTarget)
      return false;

    var model = grpTarget.model;
    if (!model)
      return false;

    var trans = model.from
    if (grpTarget.miss < count)
      return false;

    for (var k in model.cost)
      if (this.stock[k] < model.cost[k])
        return false;

    var populasOrigin = city.populas[trans.populas];
    if (!populasOrigin.transform(trans.name, count))
      return false;

    for (var k in model.cost)
      this.stock[k] -= model.cost[k];

    city.train(grpTarget, count);
    return true;
  };


  MysticCity.prototype.train = function(grp, count) {
    grp.trained += count;
    this.trained.units.push({
      grp: grp,
      model: grp.model,
      count: count,
      buildTime: grp.model.buildtime * count,
      readyAt: this.timer + grp.model.buildtime * count,
    })
  };

  MysticCity.prototype.lookForFinishBuilding = function() {
    for (var i=0; i < this.building.units.length; ++i) {
      var unit = this.building.units[i];
      if (this.timer >= unit.readyAt) {
        this.building.units.splice(i, 1);
        if (!unit.prev)
          this.addBuilding(unit);
        else {
          this.updateBuilding(unit.prev, unit.model)
          delete unit;
        }
      }
    }
  };

  MysticCity.prototype.lookForFinishTraining = function() {
    for (var i=0; i < this.trained.units.length; ++i) {
      var unit = this.trained.units[i];
      if (this.timer >= unit.readyAt) {
        this.trained.units.splice(i, 1);
        unit.grp.trained -= unit.count;
        unit.grp.count += unit.count;
      }
    }
  };


  MysticCity.prototype.updateProd = function() {
    this.prod = emptyStock(0)
    for (var i=0; i < this.units.length; ++i) {
      var unit = this.units[i]
      for (var key in unit.model.prod) {
        var qty = unit.populas.workers.count * unit.model.prod[key];
        this.prod[key] += qty;
      }
    }
  };


  MysticCity.prototype.updateConso = function() {
    this.conso = emptyStock(0)
    for (var keyPop in this.populas) {
      var populas = this.populas[keyPop];
      for (var i=0; i < populas.units.length; ++i) {
        var group =  populas.units[i]
        for (var key in group.model.conso) {
          // console.log('CONSO 3', keyPop, group.model.name, key, group.count, group.model.conso[keyRes])
          this.conso[key] += group.count * group.model.conso[key];
        }
      }
    }  
  };


  MysticCity.prototype.updateStock = function() {

    for (var k in this.stock) {
      this.stock[k] +=  (this.prod[k] - this.conso[k]) * this.speed;
      if (this.stock[k] < 0) {
        console.log ('Penurie', k)
      }

      // Stockage capacity
      this.stock[k] = Math.max(0, Math.min(this.capac[k], this.stock[k]))
    }
  };


  MysticCity.prototype.handleImmigration = function() {
    var seekers = 1 // TODO not fixed, depend of happiness or something!
    seekers = Math.min(seekers, this.populas.residents.max - this.populas.residents.count)
    this.populas.residents.randomFill(seekers);
    /*
    // Job matching
    var jobseekers = this.populas.workers.max - this.populas.workers.count
    jobseekers = Math.min(jobseekers, this.populas.residents.count - this.populas.workers.count)
    this.populas.workers.randomFill(jobseekers);
    */
  };

  MysticCity.prototype.checkChallenges = function() {
    for (var i=0; i < this.goals.length; ++i) {
      var goal = this.goals[i];
      if (goal.check(city)) {
        this.goals.splice(i, 1);
        goal.success(city);
        for (var k in goal.nexts)
          this.goals.push(this.allGoals[goal.nexts[k]])
      }
    }
  };


  // Main loop
  MysticCity.prototype.run = function() {
    this.timer += this.ticks;
    this.lookForFinishBuilding(); // Change will be record on a timing list
    this.lookForFinishTraining(); // Change will be record on a timing list
    this.handleImmigration();
    this.updateProd(); // Only if new buildings
    this.updateConso(); // Only if update on populas
    this.updateStock();

    this.checkChallenges();
  };


  root.MysticCity = MysticCity; 

}).call(this);
