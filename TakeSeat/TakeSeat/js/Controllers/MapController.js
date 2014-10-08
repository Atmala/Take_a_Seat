var seatApp = angular.module('seatApp', ['DataResources']);

seatApp.controller('Map', ['$scope', 'MapProvider', 'EmployeeProvider', function ($scope, mapProvider, employeeProvider) {

    var projects = [
			{
			    value: "shrek",
			    label: "Пушкин Александр",
			    desc: "мультфильм шрек 2",
			    icon: "shrek.jpg"
			},
			{
			    value: "рождественская история",
			    label: "мультфильм рождественская история",
			    desc: "мультфильм рождественская история",
			    icon: "cristmas.jpg"
			},
			{
			    value: "ледниковый период",
			    label: "мультфильм ледниковый период",
			    desc: "мультфильм ледниковый период",
			    icon: "lp.jpg"
			}
			,
			{
			    value: "simpsoni",
			    label: "симпсоны",
			    desc: "описание, описание, описание...",
			    icon: "simpsoni.jpg"
			}
    ];

    function setSearchAutocomplete() {
        $("#inputSearch").autocomplete({
            minLength: 0,
            source: projects,//$scope.employeeList,
            focus: function (event, ui) {
                $("#inputSearch").val(ui.item.FioShort);
                return false;
            },
            select: function (event, ui) {
                //$("#project").val(ui.item.label);
                //$("#project-id").val(ui.item.value);
                //$("#project-description").html(ui.item.desc);
                //$("#project-icon").fadeOut('slow', function () {
                //    $(this).attr("src", "images/" + ui.item.icon).fadeIn('slow');
                //});
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
        //$scope.showEditRoom();
        var div = $('#tableDropDownMenu');
        //console.log(div.style('left'));
        div.css({
            position: 'absolute',
            left: event.clientX + 'px',
            top: event.clientY + 'px',
        });
        //console.log(div.style('left'));
        $("tableDropDownMenu").hide();
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

