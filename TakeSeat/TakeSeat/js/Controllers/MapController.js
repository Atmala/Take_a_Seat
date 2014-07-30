var seatApp = angular.module('seatApp', ['DataResources']);

seatApp.controller('Map', ['$scope', 'MapProvider', function ($scope, mapProvider) {

    function initMode() {
        $scope.mode = 'view';
    }

    $scope.Init = function () {
        initMode();
        var lines = mapProvider.query(function() {
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
    }
   
}]);
