﻿var seatApp = angular.module('seatApp', ['DataResources']);

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
                //location.href = location.origin + '/Map/Index/' + ui.item.Uid;
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
        $scope.regime = { mode: 'view' };
    }

    $scope.Init = function () {
        setDefaultMode();
        $scope.wallMode = '90';

        $scope.roomObjectCollection = new RoomObjectCollection();
        $scope.showSelectRoom();
        $scope.tableDropDownMenuMode = 'buttons';
        $scope.loadEmployees();
        $scope.loadRooms();
        $scope.getUserAccess();
        if (window.paramUid) {
            var searchItem = $scope.searchByUid(window.paramUid);
            if (searchItem) $scope.doSearch(searchItem);
        }
        $scope.dbProvider = new DbProvider();
    }

    $scope.getUserAccess = function() {
        $.ajax({
            url: window.getUserAccessPath,
            data: {},
            success: function (response) {
                $scope.userAccess = response;
            }
        });
    }

    $scope.isSelected = function (section) {
        return $scope.regime.type === section || $scope.regime.mode === section;
    }

    $scope.isSelectedEmployee = function (employee) {
        return $scope.selectedEmployee && employee.Id == $scope.selectedEmployee.Id;
    }

    $scope.selectEmployee = function (employee) {
        return $scope.selectedEmployee = employee;
    }

    $scope.changeMode = function (regime) {
        if ($scope.regime.mode === regime.mode && $scope.regime.type === regime.type && $scope.regime.subtype === regime.subtype)
            setDefaultMode();
        else {
            $scope.regime = regime;
        }
    }

    $scope.showRoom = function () {
        $scope.showEditRoom();
    };

    $scope.showSelectRoom = function () {
        $scope.roomMode = "select";
        //$scope.$apply();
    }

    $scope.showEditRoom = function () {
        $scope.roomMode = "edit";
        $scope.$apply();
    }

    $scope.loadEmployees = function () {
        $.ajax({
            url: window.getEmployeesWithoutSeatPath,
            async: false,
            data: { },
            success: function(response) {
                for (var i = 0; i < response.length; i++) {
                    response[i].label = response[i].FioShort;
                    response[i].value = response[i].Id;
                }
                $scope.employeeList = response;

                setDropDownEmployeeInputAutocomplete();
            }
        });

        $.ajax({
            url: window.getElementsForSearchPath,
            async: false,
            data: {},
            success: function (response) {
                $scope.searchList = response;

                setSearchAutocomplete();
            }
        });
    }

    $scope.loadRooms = function () {
        try {
            $.ajax({
                url: window.getRoomsPath,
                async: false,
                data: { },
                success: function (response) {
                    $scope.rooms = response;
                    $scope.selectedRoom = response[0];
                    $scope.changeRoom($scope.selectedRoom.Id, true);
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

    $scope.getRoomById = function(roomId) {
        for (var i = 0; i < $scope.rooms.length; i++) {
            if ($scope.rooms[i].Id === roomId)
                return $scope.rooms[i];
        }
        return undefined;
    }

    $scope.changeRoom = function (roomId, autoFit) {
        $.ajax({
            url: window.changeRoomPath,
            data: { roomId: roomId },
            success: function (response) {
                $scope.loadingRoom = true;
                $scope.clearSelectedElements();
                $scope.room = response;
                $scope.initAllFigures();
                if (autoFit) {
                    setRightScale();
                    $scope.roomObjectCollection.updateAllPositions();
                }
                if ($scope.foundRoomObjectId) {
                    var roomObject = $scope.roomObjectCollection.getRoomObjectById($scope.foundRoomObjectId);
                    if (roomObject) roomObject.getPath();
                }
                $scope.loadingRoom = false;
            }
        });
    }

    $scope.manualChangeRoom = function(roomId, autoFit) {
        $scope.foundRoomObjectId = undefined;
        $scope.changeRoom(roomId, autoFit);
    }

    $scope.makeRoomInactive = function (roomId) {
        $.ajax({
            url: window.makeRoomInactivePath,
            type: 'POST',
            data: { roomId: roomId },
            success: function (response) {
                $scope.loadRooms();
            }
        });
    }

    $scope.deleteRoomClick = function() {
        if (confirm('Are you sure you want to delete this room?')) {
            $scope.makeRoomInactive($scope.selectedRoom.Id);
        }
    }

    $scope.undoRoom = function () {
        $scope.showSelectRoom();
    }

    $scope.saveRoom = function () {
        $.ajax({
            url: window.createNewRoomPath,
            data: { caption: $scope.roomCaption },
            success: function (roomInfo) {
                $scope.showSelectRoom();
                $scope.rooms.push(roomInfo);
                $scope.selectedRoom = roomInfo;
                $scope.$apply();
                $scope.changeRoom(roomInfo.Id, true);
            }
        });
    }

    $scope.setTableDropDownMenuMode = function(mode) {
        $scope.tableDropDownMenuMode = mode;
        $scope.$apply();
    }

    $scope.showEmployeeInput = function() {
        $scope.setTableDropDownMenuMode('employee');
        $("#tableDropDownEmployeeInput").focus();
    }

    $scope.showTableNumberInput = function () {
        $scope.setTableDropDownMenuMode('number');
        $("#tableDropDownNumberInput").focus();
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
            $scope.tableDroppedDown.RoomObject.saveIdentNumber($scope.tableDropDownNumber);
            $scope.tableDropDownNumber = "";
        }
    }

    $scope.doSearch = function(searchElement) {
        $scope.foundRoomObjectId = searchElement.RoomObjectId;
        $scope.selectedRoom = $scope.getRoomById(searchElement.RoomId);
        $scope.changeRoom(searchElement.RoomId, true);
    }

    $scope.scaleMinus = function () {
        if ($scope.zoomValue > 5) {
            $scope.zoomValue -= 5;
            setScale();
        }
    }

    $scope.scalePlus = function () {
        if ($scope.zoomValue < 200) {
            $scope.zoomValue += 5;
            setScale();
        }
    }

    $scope.scaleFit = function() {
        setRightScale();
        //setScale();
    }

    function setRightScale() {
        var borders = $scope.roomObjectCollection.getBorders();
        var zoomVert, zoomHor, zoom;
        if (borders) {
            var canvas = $('#paperCanvas')[0];
            zoomVert = (canvas.clientHeight) / borders.height;
            zoomHor = (canvas.clientWidth) / borders.width;
            zoom = Math.min(zoomVert, zoomHor);
        } else {
            zoom = 1;
        }

        $scope.zoomValue = Math.round(zoom * 100);
        if ($scope.zoomValue > 100) $scope.zoomValue = 100;
        //if ($scope.zoomValue < 75 && $scope.foundRoomObjectId) $scope.zoomValue = 75;
        //if ($scope.zoomValue < 50) $scope.zoomValue = 50;
        $scope.zoomValue = Math.round($scope.zoomValue / 5) * 5;
        zoom = $scope.zoomValue / 100;
        $scope.scale = zoom;
        $scope.globalOffset.x = borders ? Math.round(-borders.left * zoom + $scope.gridStep) : 0;
        $scope.globalOffset.y = borders ? Math.round(-borders.top * zoom + $scope.gridStep) : 0;

        if ($scope.foundRoomObjectId) {
            var table = $scope.roomObjectCollection.getRoomObjectById($scope.foundRoomObjectId);
            var viewRight = $scope.project2ViewX(table.right());
            if (viewRight > canvas.clientWidth) {
                $scope.globalOffset.x -= (viewRight - canvas.clientWidth + table.width);
            }
            var viewBottom = $scope.project2ViewY(table.bottom());
            if (viewBottom > canvas.clientHeight) {
                $scope.globalOffset.y -= (viewBottom - canvas.clientHeight + table.height);
            }
        }
    }

    function setScale() {
        $scope.scale = $scope.zoomValue / 100.0;
        $scope.roomObjectCollection.updateAllPositions();
    }

    $scope.showSettings = function () {
        var div = $("#settingsDialog");
        div.dialog();
    }

    $scope.changeWallMode = function(mode) {
        $scope.wallMode = mode;
    }

    $scope.onKeyDown = function(keyEvent) {
        alert(keyEvent);
    }

    $scope.switchEditPlanMode = function () {
        if (!$scope.editPlanMode) {
            $('#mainPanel').css('margin-left', '102px');
            $('#toolsPanel').show();
            $scope.editPlanMode = true;
        } else {
            $('#mainPanel').css('margin-left', '0px');
            $('#toolsPanel').hide();
            $scope.editPlanMode = undefined;
            setDefaultMode();
        }
    }

    $scope.importEmployees = function() {
        try {
            $.ajax({
                url: window.importEmployeesPath,
                data: {},
                success: function (response) {
                    alert(response.isError ? response.message : "Import is successful");
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

    $scope.importEmployeesWithConfirm = function () {
        try {
            $.ajax({
                url: window.getImportStatisticsPath,
                data: {},
                success: function (response) {
                    if (confirm(response.message)) {
                        $scope.importEmployees();
                    }
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

    $scope.searchByUid = function(uid) {
        for (var i = 0; i < $scope.searchList.length; i++) {
            var item = $scope.searchList[i];
            if (item.Uid === uid) return item;
        }
        return undefined;
    }

    $scope.exportEmployees = function() {
        window.location.href = window.exportEmployeesPath;
    }

}]);

