'use strict';

angular.module('liber-coffee', ['arsenal', 'hash64'])
.controller('LoadoutCtrl', function($scope, $location, arsenal, hash64){

  $scope.loadout = {stratagems: []};
  $scope.lockedStratagems = [{name: ''}];
  $scope.initDone = false;
  $scope.arsenal = arsenal;

  $scope.diceoptions = [
    {
      id: 1,
      label: "Nice dice - Favourable weighting",
      type: "weighting",
      weighting: "nice"
    },
    {
      id: 2,
      label: "Normal dice - Unweighted",
      type: "weighting"
    },
    {
      id: 3,
      label: "Helldice - Punishing weighting",
      type: "weighting",
      weighting: "hell"
    },
    {
      id: 4,
      label: "Community favourites",
      type: "pool",
      pool: "favourites"
    },
    {
      id: 5,
      label: "Community punishments",
      type: "pool",
      pool: "punishments"
    }
  ];
  $scope.dicemode = $scope.diceoptions[0];

  $scope.calcHash = function() {
    if ($scope.loadout.id) {
      $scope.url = "http://" + location.host + location.pathname + '#/~' + $scope.loadout.id;
    } else {
      var hash = '#/' + hash64.intsToB64Url([
        $scope.loadout.perk.id,
        $scope.loadout.primary.id,
        $scope.loadout.stratagems[0].id,
        $scope.loadout.stratagems[1].id,
        $scope.loadout.stratagems[2].id,
        $scope.loadout.stratagems[3].id
      ]);
      $scope.url = "http://" + location.host + location.pathname + hash;
    }
  };

  $scope.rollPerk = function() {
    $scope.loadout.perk = arsenal.getRandomPerk($scope.dicemode.weighting);
    $scope.loadout.id = null;
    if ($scope.initDone) {$scope.calcHash();}
  };

  $scope.rollPrimary = function() {
    $scope.loadout.primary = arsenal.getRandomPrimary($scope.dicemode.weighting);
    $scope.loadout.id = null;
    if ($scope.initDone) {$scope.calcHash();}
  };

  $scope.rollStratagem = function(index) {
    $scope.loadout.stratagems[index] = arsenal.getRandomStratagem(index, $scope.dicemode.weighting);
    $scope.loadout.id = null;
    if ($scope.initDone) {$scope.calcHash();}
  };

  $scope.rollallStratagems = function() {
    for(var i=0; i<4; i++) {
      $scope.loadout.stratagems[i] = arsenal.getRandomStratagem(i, $scope.dicemode.weighting);
    }
    $scope.loadout.id = null;
    
    ensureLockedStrats();

    if ($scope.initDone) {$scope.calcHash();}
  };

  $scope.rollEverything = function() {
    if ($scope.dicemode.type === "weighting") {
      $scope.rollPerk();
      $scope.rollPrimary();
      $scope.rollallStratagems();
    } else if ($scope.dicemode.type === "pool") {
      $scope.loadout = arsenal.getRandomLoadout($scope.dicemode.pool)
      $scope.calcHash();
    }

    ensureLockedStrats();

    return;
  };

  $scope.addLockedStratagem = function() {
    ensureLockedStrats();

    if ($scope.lockedStratagems.length < 4 && $scope.lockedStratagems[$scope.lockedStratagems.length - 1].name !== '') {
      $scope.lockedStratagems.push({name: ''});
    }
  }

  function ensureLockedStrats() {
    if ($scope.lockedStratagems[0].name == '') {
      return;
    }

    for (var i = 0; i < $scope.lockedStratagems.length; i++) {
      let lockedStratName = $scope.lockedStratagems[i].name;

      if (lockedStratName !== '') {
        let strat = arsenal.stratagems.find(strat => strat.name == lockedStratName);
        $scope.loadout.stratagems[i] = strat;
      }
    }
  }

  if (hash64.hashes) {
    $scope.loadout = arsenal.getLoadout(hash64.hashes[0])
    $scope.initDone = true;
    $scope.url = location.host + location.pathname + location.hash;
  } else {
    $scope.rollEverything();
    $scope.initDone = true;
    $scope.calcHash();
  }
});
