var seatApp = angular.module('seatApp', ['DataResources']);

seatApp.controller('Map', ['$scope', 'MapProvider', 'EmployeeProvider', function ($scope, mapProvider, employeeProvider) {

    function setSearchAutocomplete() {
        $("#tableDropDownEmployeeInput").autocomplete({
            minLength: 0,
            source: $scope.employeeList,
            focus: function (event, ui) {
                $("#tableDropDownEmployeeInput").val(ui.item.FioShort);
                return false;
            },
            select: function (event, ui) {
                $scope.assignEmployee($scope.tableDroppedDown, ui.item);
                $('#tableDropDownEmployeeInput').val('');
                loadEmployees();
                return false;
            }
        })
		.data("autocomplete")._renderItem = function (ul, item) {
		    return $("<li></li>")
				.data("item.autocomplete", item)
				.append("<a>" + item.FioShort + "</a>")
				.appendTo(ul);
		};
    }
    

    function initMode() {
        $scope.mode = 'view';
    }

    $scope.Init = function () {
        initMode();
        $scope.showSelectRoom();
        $scope.showTableButtonsDropDownPanel();
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

    $scope.showRoom = function () {
        $scope.showEditRoom();
    };

    $scope.showSelectRoom = function () {
        $("#selectRoomDiv").show();
        $("#editRoomDiv").hide();
    }

    $scope.showEditRoom = function () {
        $("#selectRoomDiv").hide();
        $("#editRoomDiv").show();
    }

    $scope.loadEmployees = function () {
        employeeProvider.query(function (response) {
            for (var i = 0; i < response.length; i++) {
                response[i].label = response[i].FioShort;
                response[i].valueOf = response[i].Id;
            }
            $scope.employeeList = response;
            
            setSearchAutocomplete();
            $scope.$apply();
        });
    }

    $scope.loadRooms = function () {
        mapProvider.GetRooms(function (response) {
            $scope.rooms = response;
            $scope.selectedRoom = response[0];
            $scope.$apply();
            $scope.changeRoom($scope.selectedRoom.Id);
        });
    }

    $scope.changeRoom = function (roomId) {
        mapProvider.ChangeRoom({ roomId: roomId }, function (response) {
            $scope.room = response;
            $scope.initAllFigures();
        });
    }

    $scope.undoRoom = function () {
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

    $scope.showTableEmployeeDropDownPanel = function() {
        $("#tableDropDownMenuButtons").hide();
        $("#tableDropDownMenuEmployee").show();
        $("#tableDropDownMenuNumber").hide();
    }

    $scope.showTableButtonsDropDownPanel = function () {
        $("#tableDropDownMenuButtons").show();
        $("#tableDropDownMenuEmployee").hide();
        $("#tableDropDownMenuNumber").hide();
    }

    $scope.showTableNumberDropDownPanel = function () {
        $("#tableDropDownMenuButtons").hide();
        $("#tableDropDownMenuEmployee").hide();
        $("#tableDropDownMenuNumber").show();
        $("#tableDropDownNumberInput").val('');
    }

    $scope.discardEmployee = function () {
        $scope.discardEmployeeByTable($scope.tableDroppedDown);
    }

    $scope.tableNumberKeyPress = function(event) {
        if (event.which === 13) {
            var identNumber = $("#tableDropDownNumberInput").val();
            $scope.tableDroppedDown.RoomObject.saveIdentNumber(identNumber);
        }
    }

    //$('#tableDropDownEmployeeInput').keypress(function(e) {
    //    alert(e.which);
    //});

}]);

