var seatApp = angular.module('seatApp', ['DataResources']);

seatApp.controller('Map', ['$scope', 'MapProvider', '$http', function ($scope, mapProvider, $http) {

    function initMode() {
        $scope.mode = 'view';
    }

    $scope.Init = function () {
        initMode();

        var room = mapProvider.Get(function(response) {
            $scope.room = response;
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
    }

    $scope.SaveLine = function() {
        mapProvider.SaveLine(
        { canvasX1: 100, canvasY1: 100, canvasX2: 100, canvasY2: 100 },
            function () {
                $scope.result = lines;
            });
    }
   
}]);

