var seatApp = angular.module('seatApp', ['DataResources']);

seatApp.controller('Map', ['$scope', 'MapProvider', 'EmployeeProvider', function ($scope, mapProvider, employeeProvider) {

    function initMode() {
        $scope.mode = 'view';
    }

    $scope.Init = function () {
        initMode();
        $scope.showSelectRoom();
        $scope.loadEmployees();
        $scope.loadRooms();
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
        $scope.$apply();
    }

    $scope.showRoom = function() {
        $scope.showEditRoom();
    };

    $scope.showSelectRoom = function () {
        $("#selectRoomDiv").show();
        $("#editRoomDiv").hide();
    }

    $scope.showEditRoom = function() {
        $("#selectRoomDiv").hide();
        $("#editRoomDiv").show();
    }

    $scope.loadEmployees = function() {
        employeeProvider.query(function (response) {
            $scope.employeeList = response;
            $scope.$apply();
        });
    }

    $scope.loadRooms = function() {
        mapProvider.GetRooms(function(response) {
            $scope.rooms = response;
            $scope.selectedRoom = response[0];
            $scope.$apply();
            $scope.changeRoom($scope.selectedRoom.Id);
        });
    }

    $scope.changeRoom = function(roomId) {
        mapProvider.ChangeRoom({ roomId: roomId }, function(response) {
            $scope.room = response;
            $scope.initAllFigures();
        });
    }

    $scope.undoRoom = function() {
        $scope.showSelectRoom();
    }

    $scope.saveRoom = function () {
        var caption = $("#roomCaptionInput").val();
        mapProvider.CreateNewRoom({ caption: caption }, function (roomInfo) {
            $scope.showSelectRoom();
            $scope.rooms.push(roomInfo);
            $scope.selectedRoom = roomInfo;
            $scope.$apply();
            $scope.changeRoom(roomInfo.Id);
        });
    }

    function setSelectedRoom(roomId) {
        for (var i = $scope.rooms.length - 1; i >= 0; i--) {
            var room = $scope.rooms[i];
            if (room.Id == roomId) {
                $scope.selectedRoom = room;
                $scope.apply();
            }
        }
    }

}]);

