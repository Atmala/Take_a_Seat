
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isMoved = false;
                    var rectangleWidth = 70, rectangleHeight = 100;
                    var roomObjectFactory = new RoomObjectFactory(scope, mapProvider);
                    var selectedTable, roomObjectToMove, selectedRoomObject;

                    scope.color = '#000000';
                    scope.fontColor = '#000000';
                    scope.wallColor = '#888888';
                    scope.foundColor = 'blue';
                    scope.globalOffset = new paper.Point();
                    scope.zoomValue = 100;
                    scope.scale = 1.0;
                    scope.gridStep = 10;

                    function mouseDown(event) {
                        if (scope.loadingRoom) return;
                        fixEvent(event);
                        var x = scope.toScaledGridX(event.offsetX);
                        var y = scope.toScaledGridY(event.offsetY);

                        if (scope.editPlanMode) {
                            if (scope.mode === 'line') {
                                path = getNewPath();
                            } else if (scope.mode === 'table') {
                                path = roomObjectFactory.createTable(x, y, rectangleWidth, rectangleHeight);
                            } else if (scope.mode === 'text') {
                                scope.screenTextDroppedDown = undefined;
                                scope.screenTextDropDownX = x;
                                scope.screenTextDropDownY = y;
                                scope.showScreenTextDropDownMenu(x - 50, y - 10, '');
                            } else if (scope.mode === 'delete') {
                                if (selectedRoomObject) {
                                    scope.roomObjectCollection.deleteRoomObjectById(selectedRoomObject.Id);
                                    selectedRoomObject.deleteRoomObject();
                                    selectedRoomObject = undefined;
                                }
                            } else {
                                roomObjectToMove = selectedRoomObject;
                            }
                        }

                        if (scope.mode !== 'delete' && scope.mode != 'text') {
                            mouseDownPoint = new paper.Point([x, y]);
                        }
                    }

                    function mouseUp(event) {
                        if (scope.loadingRoom) return;
                        fixEvent(event);
                        if (roomObjectToMove && isMoved) {
                            if (roomObjectToMove.save)
                                roomObjectToMove.save();
                            roomObjectToMove = undefined;
                        } else {
                            if (selectedRoomObject && selectedRoomObject.showDropDownMenu)
                                selectedRoomObject.showDropDownMenu();
                        }

                        mouseDownPoint = undefined;
                        isMoved = false;

                        if (path && scope.mode === 'line') {
                            roomObjectFactory.createWall(path);
                        }
                    }

                    function mouseMove(event) {
                        if (scope.loadingRoom) return;
                        fixEvent(event);

                        var x = event.offsetX;
                        var y = event.offsetY;

                        if (scope.mode === 'line' && mouseDownPoint) {
                            if (event.offsetX <= 2 || event.offsetY <= 2 ||
                                event.offsetX >= event.currentTarget.width - 2 || event.offsetY >= event.currentTarget.height - 2) {
                                mouseUp();
                                return;
                            }

                            path.removeSegments();
                            drawLine(mouseDownPoint, new getPointForWall(
                                mouseDownPoint, new paper.Point([x, y]), scope.wallMode));

                        } else if (scope.mode === 'table' && mouseDownPoint) {
                            path.position = new paper.Point([x, y]);
                        } else if (scope.mode === 'view' && mouseDownPoint) {
                            if (Math.abs(x - mouseDownPoint.x) > 0 || Math.abs(y - mouseDownPoint.y) > 0) {
                                isMoved = true;
                                moveMapObjects(x, y);
                            }
                        } else {
                            selectItemByCoordinates(event.offsetX, event.offsetY);
                            if (!selectedRoomObject || !(selectedRoomObject.RoomObjectType === 'table')) {
                                scope.tableDropDownMenuVisible = false;
                            }
                            if (!selectedRoomObject || !(selectedRoomObject.RoomObjectType === 'screentext')) {
                                scope.screenTextDropDownMenuVisible = false;
                            }
                        }
                        setCurrentCoords(x, y);
                        scope.$apply();
                    }

                    function fixEvent(event) {
                        event.offsetX = (event.offsetX || event.clientX - $(event.target).offset().left);
                        event.offsetY = (event.offsetY || event.clientY - $(event.target).offset().top);
                    }

                    function moveMapObjects(x, y) {
                        var offsetX = x - mouseDownPoint.x;
                        var offsetY = y - mouseDownPoint.y;
                        var scaledGridStep = scope.gridStep * scope.scale;
                        if (Math.abs(offsetX) < scaledGridStep && Math.abs(offsetY) < scaledGridStep) return;

                        if (roomObjectToMove && scope.editPlanMode) movePath(offsetX, offsetY);
                        else moveAllItems(offsetX, offsetY);
                        mouseDownPoint = new paper.Point(x, y);
                    }

                    function movePath(offsetX, offsetY) {
                        roomObjectToMove.move(offsetX, offsetY);

                    }

                    function moveAllItems(offsetX, offsetY) {
                        scope.globalOffset.x += offsetX;
                        scope.globalOffset.y += offsetY;
                        scope.roomObjectCollection.updateAllPositions();
                    }

                    function unselectSelectedRoomObject() {
                        if (selectedRoomObject) {
                            if (selectedRoomObject.unselect)
                                selectedRoomObject.unselect();
                            selectedRoomObject = undefined;
                        }
                    }

                    function selectItemByCoordinates(x, y) {
                        unselectSelectedRoomObject();
                        var point = new paper.Point(x, y);
                        selectedRoomObject = scope.roomObjectCollection.findRoomObject(point, 5);
                    }

                    function setCurrentCoords(x, y) {
                        scope.X = x;
                        scope.Y = y;
                        scope.XProject = scope.view2ProjectX(x);
                        scope.YProject = scope.view2ProjectY(y);
                        if (!selectedRoomObject || !selectedRoomObject.attachedPath.segments || selectedRoomObject.attachedPath.segments.length != 2)
                            scope.LogMessage = undefined;
                        else {
                            var segments = selectedRoomObject.attachedPath.segments;
                            scope.LogMessage = '(' + segments[0].point.x + ' : ' + segments[0].point.y + ') - (' +
                                segments[1].point.x + ' : ' + segments[1].point.y + ')';
                        }
                    }

                    function drawLine(startPoint, endPoint) {
                        path.moveTo(startPoint);
                        path.lineTo(endPoint);
                    }

                    scope.setWallAppearance = function (wallPath, subtype) {
                        if (subtype === 1) {
                            wallPath.strokeWidth = 4;
                            wallPath.strokeColor = scope.wallColor;
                        } else {
                            wallPath.strokeWidth = 2;
                            wallPath.strokeColor = scope.wallColor;
                        }
                    }

                    function getNewPath() {
                        var newPath = new paper.Path();
                        scope.setWallAppearance(newPath, scope.roomObjectSubType);
                        return newPath;
                    }

                    function initPaper() {
                        paper.install(window);
                        var canvas = $('#paperCanvas');
                        paper.setup(canvas[0]);

                        paper.view.draw();
                    }

                    scope.initAllFigures = function () {
                        scope.RoomCaption = scope.room.Caption;

                        if (project.activeLayer) project.activeLayer.remove();
                        scope.roomObjectCollection.clear();
                        scope.$watch('scope.room.RoomObjects', function () {
                            _.each(scope.room.RoomObjects, function (roomObject) {
                                roomObjectFactory.getPathByDbRoomObject(roomObject);
                            });
                            paper.view.draw();
                        });
                        scope.$apply();
                    }

                    scope.view2ProjectX = function (viewX) {
                        return scope.toGrid(Math.round((viewX - scope.globalOffset.x) / scope.scale));
                    }

                    scope.view2ProjectY = function (viewY) {
                        return scope.toGrid(Math.round((viewY - scope.globalOffset.y) / scope.scale));
                    }

                    scope.view2Project = function (point) {
                        return {
                            x: scope.view2ProjectX(point.x),
                            y: scope.view2ProjectY(point.y)
                        };
                    }

                    scope.view2ProjectXNoGrid = function (viewX) {
                        return Math.round((viewX - scope.globalOffset.x) / scope.scale);
                    }

                    scope.view2ProjectYNoGrid = function (viewY) {
                        return Math.round((viewY - scope.globalOffset.y) / scope.scale);
                    }

                    scope.project2ViewX = function (projectX) {
                        return Math.round(projectX * scope.scale + scope.globalOffset.x);
                    }

                    scope.project2ViewY = function (projectY) {
                        return Math.round(projectY * scope.scale + scope.globalOffset.y);
                    }

                    function get90PointForWall(start, point) {
                        if (Math.abs(point.x - start.x) > Math.abs(point.y - start.y))
                            return new paper.Point([point.x, start.y]);
                        else
                            return new paper.Point([start.x, point.y]);
                    }

                    function get45PointForWall(start, point) {
                        return point;
                    }

                    function getPointForWall(start, point, mode) {
                        switch (mode) {
                            case '90':
                                return get90PointForWall(start, point);
                            case '45':
                                return get45PointForWall(start, point);
                            default:
                                return point;
                        }
                    }

                    scope.showScreenTextDropDownMenu = function (x, y, text) {
                        var canvas = $('#paperCanvas')[0];
                        scope.screenTextDropDownMenuVisible = true;
                        scope.$apply();

                        var dropDownMenu = $("#screenTextDropDownMenu");
                        dropDownMenu.css({
                            left: x + canvas.offsetLeft,
                            top: y + canvas.offsetTop,
                        });
                        scope.screenTextDropDownText = text;
                        $("#screenTextDropDownNumberInput").focus();
                    }

                    scope.screenTextDropDownKeyPress = function (event) {
                        if (event.which === 13) {
                            if (scope.screenTextDroppedDown) {
                                scope.screenTextDroppedDown.RoomObject.saveText(scope.screenTextDropDownText);
                            } else {
                                roomObjectFactory.createScreenText(scope.screenTextDropDownX, scope.screenTextDropDownY,
                                    scope.screenTextDropDownText);
                            }
                            scope.screenTextDropDownText = "";
                            scope.screenTextDropDownMenuVisible = false;
                        }
                    }

                    scope.toGrid = function (coord) {
                        if (scope.gridStep === 1) return coord;
                        return Math.round(coord / scope.gridStep) * scope.gridStep;
                    }

                    scope.toScaledGridX = function (x) {
                        if (scope.gridStep === 1) return x;
                        if (scope.scale === 1) return scope.toGrid(x);
                        var projectX = scope.view2ProjectX(x);
                        return scope.project2ViewX(projectX);
                    }

                    scope.toScaledGridY = function (y) {
                        if (scope.gridStep === 1) return y;
                        if (scope.scale === 1) return scope.toGrid(y);
                        var projectY = scope.view2ProjectY(y);
                        return scope.project2ViewY(projectY);
                    }

                    scope.clearSelectedElements = function () {
                        selectedRoomObject = undefined;
                        selectedTable = null;
                    }

                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    element.bind("keydown keypress", function (event) {
                        alert(event.which);
                    });

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);
