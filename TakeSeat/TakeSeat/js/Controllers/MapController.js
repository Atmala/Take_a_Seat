var seatApp = angular.module('seatApp', ['DataResources']);

seatApp.controller('Map', ['$scope', 'MapProvider', 'EmployeeProvider', function ($scope, mapProvider, employeeProvider) {

    function initMode() {
        $scope.mode = 'view';
    }

    $scope.Init = function () {
        initMode();
        $scope.loadEmployees();
    }

    $scope.isSelected = function (section) {
        return $scope.mode === section;
    }

    $scope.isSelectedEmployee = function (employee) {
        return $scope.selectedEmployee && employee.Id == $scope.selectedEmployee.Id;
    }

    $scope.selectEmployee = function (employee) {
        return $scope.selectedEmployee = employee;
    }

    $scope.changeMode = function (mode) {
        if ($scope.isSelected(mode))
            initMode();
        else
            $scope.mode = mode;
    }

    $scope.showRoom = function() {
        mapProvider.Get(function(response) {
            $scope.room = response;
            $scope.initAllFigures();
        });
    };

    $scope.loadEmployees = function() {
        employeeProvider.query(function (response) {
            $scope.employeeList = response;
            $scope.$apply();
        });
    }

}]);

