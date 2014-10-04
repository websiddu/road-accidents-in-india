(function() {
  var app;

  app = angular.module("app", []);

  app.controller("mainCtrl", [
    "$scope", function($scope) {
      return $scope.colors = [
        {
          color: "#FFE4D9",
          range: "0 - 500"
        }, {
          color: "#fcbba1",
          range: "500 - 3000"
        }, {
          color: "#fc9272",
          range: "3000 - 6000"
        }, {
          color: "#fb6a4a",
          range: "6000 - 12000"
        }, {
          color: "#ef3b2c",
          range: "12000 - 24000"
        }, {
          color: "#cb181d",
          range: "24000 - 48000"
        }, {
          color: "#99000d",
          range: "48000 - 80000"
        }
      ];
    }
  ]);

}).call(this);
