﻿
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isMoved = false;
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
                        var point = new paper.Point([x, y]);

                        if (scope.regime.mode === 'view') {
                            roomObjectToMove = selectedRoomObject;
                            mouseDownPoint = new paper.Point([x, y]);
                            return;
                        }

                        if (scope.editPlanMode) {
                            switch (scope.regime.mode) {
                                case 'add': 
                                    if (scope.regime.type === 'wall') {
                                        selectedRoomObject = roomObjectFactory.createByType(scope.regime.type);
                                        selectedRoomObject.createByClick(point);
                                        roomObjectToMove = selectedRoomObject;
                                        mouseDownPoint = new paper.Point([x, y]);
                                    } else if (scope.regime.type === 'table') {
                                        selectedRoomObject = roomObjectFactory.createByType(scope.regime.type);
                                        selectedRoomObject.createByClick(point);
                                        roomObjectToMove = selectedRoomObject;
                                        mouseDownPoint = new paper.Point([x, y]);
                                    } else if (scope.regime.type === 'text') {
                                        scope.screenTextDroppedDown = undefined;
                                        scope.screenTextDropDownX = x;
                                        scope.screenTextDropDownY = y;
                                        scope.showScreenTextDropDownMenu(x - 50, y - 10, '');
                                    }
                                    break;
                                case 'delete': 
                                    if (selectedRoomObject) {
                                        scope.roomObjectCollection.deleteRoomObjectById(selectedRoomObject.roomObjectId);
                                        selectedRoomObject.deleteRoomObject();
                                        selectedRoomObject = undefined;
                                    }
                                    break;
                            }
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

                        if (path && scope.regime.mode === 'add' && scope.regime.type === 'wall') {
                            selectedRoomObject.onMouseUp();
                        }
                    }
                    
                    function mouseMove(event) {
                        if (scope.loadingRoom) return;
                        fixEvent(event);

                        var x = event.offsetX;
                        var y = event.offsetY;

                        if (scope.regime.type === 'wall' && mouseDownPoint) {
                            if (event.offsetX <= 2 || event.offsetY <= 2 ||
                                event.offsetX >= event.currentTarget.width - 2 || event.offsetY >= event.currentTarget.height - 2) {
                                mouseUp();
                                return;
                            }
                            isMoved = true;
                            moveMapObjects(x, y);
                            //path.removeSegments();
                            //drawLine(mouseDownPoint, new getPointForWall(
                            //    mouseDownPoint, new paper.Point([x, y]), scope.wallMode));

                        } else if (scope.regime.type === 'table' && mouseDownPoint) {
                            path.position = new paper.Point([x, y]);
                        } else if (scope.regime.mode === 'view' && mouseDownPoint) {
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
                    //    scope.X = x;
                    //    scope.Y = y;
                    //    scope.XProject = scope.view2ProjectX(x);
                    //    scope.YProject = scope.view2ProjectY(y);
                    //    if (!selectedRoomObject || !selectedRoomObject.attachedPath.segments || selectedRoomObject.attachedPath.segments.length != 2)
                    //        scope.LogMessage = undefined;
                    //    else {
                    //        var segments = selectedRoomObject.attachedPath.segments;
                    //        scope.LogMessage = '(' + segments[0].point.x + ' : ' + segments[0].point.y + ') - (' +
                    //            segments[1].point.x + ' : ' + segments[1].point.y + ')';
                    //    }
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
