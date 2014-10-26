var seatApp = angular.module('seatApp', ['DataResources']);

seatApp.controller('Map', ['$scope', 'MapProvider', 'EmployeeProvider', function ($scope, mapProvider, employeeProvider) {

    function setDropDownEmployeeInputAutocomplete() {
        $("#tableDropDownEmployeeInput").autocomplete({
            minLength: 0,
            source: $scope.employeeList,
            focus: function (event, ui) {
                $("#tableDropDownEmployeeInput").val(ui.item.FioShort);
                return false;
            },
            select: function (event, ui) {
                $scope.tableDroppedDown.RoomObject.assignEmployee(ui.item);
                $('#tableDropDownEmployeeInput').val('');
                $scope.loadEmployees();
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

    function setSearchAutocomplete() {
        $("#inputSearch").autocomplete({
            minLength: 0,
            source: $scope.searchList,
            focus: function (event, ui) {
                $("#inputSearch").val(ui.item.label);
                return false;
            },
            select: function (event, ui) {
                $scope.doSearch(ui.item);
                $('#inputSearch').val('');
                
                return false;
            }
        })
		.data("autocomplete")._renderItem = function (ul, item) {
		    return $("<li></li>")
				.data("item.autocomplete", item)
				.append("<a>" + item.label + "</a>")
				.appendTo(ul);
		};
    }
    
    function setDefaultMode() {
        $scope.mode = 'view';
        $scope.roomObjectSubType = undefined;
    }

    $scope.Init = function () {
        setDefaultMode();
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

    $scope.changeMode = function (mode, subtype) {
        if ($scope.isSelected(mode) && (!subtype || subtype === $scope.roomObjectSubType))
            setDefaultMode();
        else {
            $scope.mode = mode;
            $scope.roomObjectSubType = subtype;
        }
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
        $.ajax({
            url: window.getEmployeesWithoutSeatPath,
            data: { },
            success: function(response) {
                for (var i = 0; i < response.length; i++) {
                    response[i].label = response[i].FioShort;
                    response[i].value = response[i].Id;
                }
                $scope.employeeList = response;

                setDropDownEmployeeInputAutocomplete();
                $scope.$apply();
            }, error: function (req, status, error) {
                alert("Error: " + error);
            }
        });

        $.ajax({
            url: window.getElementsForSearchPath,
            data: {},
            success: function (response) {
                $scope.searchList = response;

                setSearchAutocomplete();
                $scope.$apply();
            }, error: function (req, status, error) {
                alert("Error: " + error);
            }
        });
    }

    $scope.loadRooms = function () {
        try {
            $.ajax({
                url: window.getRoomsPath,
                data: { },
                success: function (response) {
                    $scope.rooms = response;
                    $scope.selectedRoom = response[0];
                    $scope.$apply();
                    $scope.changeRoom($scope.selectedRoom.Id);
                },
                error: function (req, status, error) {
                    alert("Error: " + error);
                }
            });
        }
        catch (e) {
            alert(e.description);
        }
    }

    $scope.changeRoom = function (roomId) {
        $.ajax({
            url: window.changeRoomPath,
            data: { roomId: roomId },
            success: function (response) {
                $scope.room = response;
                $scope.initAllFigures();
            }
        });
    }

    $scope.undoRoom = function () {
        $scope.showSelectRoom();
    }

    $scope.saveRoom = function () {
        var caption = $("#roomCaptionInput").val();
        $.ajax({
            url: window.createNewRoomPath,
            data: { caption: caption },
            success: function (roomInfo) {
                $scope.showSelectRoom();
                $scope.rooms.push(roomInfo);
                $scope.selectedRoom = roomInfo;
                $scope.$apply();
                $scope.changeRoom(roomInfo.Id);
            }
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
        $scope.tableDroppedDown.RoomObject.discardEmployee();
    }

    $scope.rotateTable = function() {
        $scope.tableDroppedDown.RoomObject.rotate();
        $scope.tableDroppedDown.RoomObject.saveAngle();
    }

    $scope.tableNumberKeyPress = function(event) {
        if (event.which === 13) {
            var identNumber = $("#tableDropDownNumberInput").val();
            $scope.tableDroppedDown.RoomObject.saveIdentNumber(identNumber);
        }
    }

    function getRoomById(roomId) {
        for (var i = 0; i < $scope.rooms.length; i++) {
            if ($scope.rooms[i].Id === roomId) return $scope.rooms[i];
        }
        return null;
    }

    $scope.doSearch = function(searchElement) {
        $scope.foundRoomObjectId = searchElement.RoomObjectId;
        $scope.foundRoomObjectId = searchElement.RoomObjectId;
        $scope.changeRoom(searchElement.RoomId);
        var room = getRoomById(searchElement.RoomId);
        if (room) $scope.selectedRoom = room;

        //for (var i = 0; i < project.activeLayer.children.length; i++) {
        //    var item = project.activeLayer.children[i];
        //    if (item.RoomObject && item.RoomObject.setCaptions) {
        //        var isFound = item.RoomObject.roomObjectId === searchElement.RoomObjectId;
        //        if (item.RoomObject.isFoundItem != isFound) {
        //            item.RoomObject.isFoundItem = isFound;
        //            item.RoomObject.setCaptions();
        //        }
        //    }
        //}
    }

}]);

