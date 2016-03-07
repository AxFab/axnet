
(function () {
  var root = this;

  var MysticModels = function(opt)
  {
    opt.prod = opt.prod || {};
    opt.capac = opt.capac || {};
    opt.canBuild = opt.canBuild || false;
    return opt;
  };


  MysticModels.farm = MysticModels({
    name:'Small Farm',
    buildtime: 30,
    canBuild: true,
    cost: { wood:15, },
    prod: { cereals: 35, },
    capac: { cereals: 200, },
    workers: [
      { model:'farmer', max:3, level:2 },
    ],
    residents: [
      { model:'peon', max:5, level:2 },
    ],
    update:['farm2'],
  });

  MysticModels.farm2 = MysticModels({
    name:'Small Farm',
    isUpdate: true,
    buildtime: 90,
    cost: { wood:30, },
    prod: { cereals: 35, },
    capac: { cereals: 300, },
    workers: [
      { model:'farmer', max:8, level:2 },
    ],
    residents: [
      { model:'peon', max:5, level:2 },
    ],
  });

  MysticModels.sawmill = MysticModels({
    name:'Saw mill',
    buildtime: 30,
    canBuild: true,
    cost: { wood:10, },
    prod: { wood: 12, },
    capac: { wood: 200, },
    workers: [
      { model:'carpenter', max:3, level:2 },
    ],
  });

  MysticModels.house = MysticModels({
    name:'House',
    buildtime: 60,
    cost: { wood:15, },
    residents: [
      { model:'peon', max:10, level:2 },
    ],
  });

  MysticModels.militia = MysticModels({
    name:'Militia',
    buildtime: 150,
    cost: { wood:20, gold:10 },
    soldiers: [
      { model:'lancer', max:5, level:2 },
    ]
  });

  MysticModels.cityhall = MysticModels({
    name:'City hall',
    buildtime: 300,
    prod: { gold:6, },
    capac: { gold:50 },
    cost: { wood:35, gold:15, rock:10 },
    workers: [
      { model:'perceptor', max:5, level:2 },
    ],
  });



  MysticModels.lancer = MysticModels({
    name:'Lancer',
    attack:5,
    buildtime: 60,
    from: { populas:'residents', name:'peon' },
    cost: { wood:10, gold:10 },
    conso: { gold:2, cereals:5 },
  });




  MysticModels.farmer = MysticModels({
    name:'Farmer',
    buildtime: 5,
    from: { populas:'residents', name:'peon' },
    cost: { cereals:5 },
    conso: { gold:1, cereals:3 },
  });

  MysticModels.carpenter = MysticModels({
    name:'Carpenter',
    buildtime: 5,
    from: { populas:'residents', name:'peon' },
    cost: { cereals:5 },
    conso: { gold:1, cereals:3 },
  });

  MysticModels.perceptor = MysticModels({
    name:'Perceptor',
    buildtime: 30,
    from: { populas:'residents', name:'peon' },
    cost: { cereals:5, gold:10 },
    conso: { cereals:20 },
  });

  MysticModels.peon = MysticModels({
    name:'Villager',
    cost: { cereals:5 },
    conso: { gold:-1, cereals:3 },
  });


  root.MysticModels = MysticModels; 

}).call(this);
