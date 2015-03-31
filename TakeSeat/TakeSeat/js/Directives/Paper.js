
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var mouseDownPoint, selectedRoomObject;
                    var roomObjectFactory = new RoomObjectFactory(scope, mapProvider);

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
                        fixEventForFirefox(event);
                        var x = scope.toScaledGridX(event.offsetX);
                        var y = scope.toScaledGridY(event.offsetY);
                        var point = new paper.Point([x, y]);

                        if (scope.regime.mode === 'view') {
                            if (selectedRoomObject) selectedRoomObject.onMouseDown();
                            mouseDownPoint = new paper.Point([x, y]);
                            return;
                        }

                        if (scope.editPlanMode) {
                            switch (scope.regime.mode) {
                                case 'add':
                                    selectedRoomObject = roomObjectFactory.createByType(scope.regime.type);
                                    selectedRoomObject.createByClick(point);
                                    if (selectedRoomObject.isMoving())
                                        mouseDownPoint = new paper.Point([x, y]);
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

                        if (selectedRoomObject && selectedRoomObject.onMouseUp) {
                            selectedRoomObject.onMouseUp();
                        }
                        mouseDownPoint = undefined;
                    }
                    
                    function mouseMove(event) {
                        if (scope.loadingRoom) return;
                        fixEventForFirefox(event);

                        var x = event.offsetX;
                        var y = event.offsetY;
                        
                        if (mouseDownPoint) {
                            if (x <= 2 || y <= 2 || x >= event.currentTarget.width - 2 || y >= event.currentTarget.height - 2) {
                                mouseUp();
                                return;
                            }
                            moveMapObjects(x, y);
                        } else {
                            var point = new paper.Point(x, y);
                            var newSelectedRoomObject = scope.roomObjectCollection.findRoomObject(point, 5);
                            if (selectedRoomObject && selectedRoomObject !== newSelectedRoomObject) {
                                if (selectedRoomObject.unselect) selectedRoomObject.unselect();
                            }
                            selectedRoomObject = newSelectedRoomObject;
                            if (selectedRoomObject && selectedRoomObject.select) selectedRoomObject.select();
                        }
                        setCurrentCoords(x, y);
                        scope.$apply();
                    }

                    function fixEventForFirefox(event) {
                        event.offsetX = (event.offsetX || event.clientX - $(event.target).offset().left);
                        event.offsetY = (event.offsetY || event.clientY - $(event.target).offset().top);
                    }

                    function moveMapObjects(x, y) {
                        var offsetX = x - mouseDownPoint.x;
                        var offsetY = y - mouseDownPoint.y;
                        var scaledGridStep = scope.gridStep * scope.scale;
                        if (Math.abs(offsetX) < scaledGridStep && Math.abs(offsetY) < scaledGridStep) return;

                        if (scope.editPlanMode && selectedRoomObject && selectedRoomObject.isMoving())
                            selectedRoomObject.move(offsetX, offsetY);
                        else
                            moveAllItems(offsetX, offsetY);

                        mouseDownPoint = new paper.Point(x, y);
                    }

                    function moveAllItems(offsetX, offsetY) {
                        scope.globalOffset.x += offsetX;
                        scope.globalOffset.y += offsetY;
                        scope.roomObjectCollection.updateAllPositions();
                    }

                    function setCurrentCoords(x, y) {
                        scope.X = x;
                        scope.Y = y;
                        scope.selectedItemLogText = selectedRoomObject ? selectedRoomObject.dbCoordinatesString() : "unselected";
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

                    scope.screenTextDropDownKeyPress = function(event) {
                        if (event.which === 13) {
                            if (selectedRoomObject && selectedRoomObject.saveText) {
                                selectedRoomObject.saveText(scope.screenTextDropDownText);
                            }
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
