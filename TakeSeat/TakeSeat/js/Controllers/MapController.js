var seatApp = angular.module('seatApp', []);

seatApp.controller('Map', ['$scope', function ($scope) {

    function initMode() {
        $scope.mode = 'view';
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

    initMode();
}]);
