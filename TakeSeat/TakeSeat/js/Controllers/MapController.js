var seatApp = angular.module('seatApp', ['DataResources']);

seatApp.controller('Map', ['$scope', 'MapProvider', function ($scope, mapProvider) {

    function initMode() {
        $scope.mode = 'view';
    }

    $scope.Init = function () {
        initMode();
        var lines = mapProvider.Get(function() {
            $scope.lines = lines;
        });
    }

    $scope.isSelected = function (section) {
        return $scope.mode === section;
    }

    $scope.changeMode = function (mode) {
        if ($scope.isSelected(mode))
            initMode();
        else
            $scope.mode = mode;

        mapProvider.SaveLine(
        { canvasX1: 100, canvasY1: 100, canvasX2 : 100, canvasY2 : 100},
            function () {
            $scope.result = lines;
        });
    }
   
}]);
