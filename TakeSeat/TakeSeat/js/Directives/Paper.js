
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isMoved = false;
                    var rectangleWidth = 70, rectangleHeight = 100;
                    var roomObjectFactory = new RoomObjectFactory(scope, mapProvider);
                    var selectedPath, selectedSegment, numberOfPointUnderMove, pathToMove, segmentToMove;

                    scope.color = '#000000';
                    scope.fontColor = '#000000';
                    scope.wallColor = '#888888';
                    scope.foundColor = 'blue';
                    scope.globalOffset = new paper.Point();
                    scope.zoomValue = 100;
                    scope.scale = 1.0;
                    scope.gridStep = 10;

                    function mouseDown(event) {
                        fixEvent(event);
                        var x = scope.toScaledGridX(event.offsetX);
                        var y = scope.toScaledGridY(event.offsetY);

                        if (scope.editPlanMode) {
                            if (scope.mode === 'line') {
                                path = getNewPath();
                            } else if (scope.mode === 'table') {
                                path = roomObjectFactory.createTable(x, y, rectangleWidth, rectangleHeight);
                            } else if (scope.mode === 'text') {
                                path = roomObjectFactory.createScreenText(x, y, 'Some Interesting Text');
                            } else if (scope.mode === 'delete') {
                                if (selectedPath) {
                                    scope.roomObjectCollection.deleteRoomObjectById(selectedPath.RoomObject.Id);
                                    selectedPath.RoomObject.deleteRoomObject();
                                    selectedPath.remove();
                                }
                            } else {
                                pathToMove = selectedPath;
                                segmentToMove = selectedSegment;
                            }
                        }

                        if (scope.mode !== 'delete') {
                            mouseDownPoint = new paper.Point([x, y]);
                        }
                    }

                    function mouseUp(event) {
                        fixEvent(event);
                        if (pathToMove && isMoved) {
                            if (pathToMove.RoomObject.save)
                                pathToMove.RoomObject.save();
                            pathToMove = undefined;
                        } else {
                            if (selectedPath && selectedPath.RoomObject.showDropDownMenu)
                                selectedPath.RoomObject.showDropDownMenu();
                        }

                        mouseDownPoint = undefined;
                        isMoved = false;

                        if (path && scope.mode === 'line') {
                            roomObjectFactory.createWall(path);
                        }
                    }

                    function mouseMove(event) {
                        fixEvent(event);

                        //var x = scope.toScaledGridX(event.offsetX);
                        //var y = scope.toScaledGridY(event.offsetY);
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
                            if (!selectedPath || !(selectedPath.RoomObject.RoomObjectType === 'table')) {
                                scope.tableDropDownMenuVisible = false;
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

                        //if (segmentToMove && scope.editPlanMode) moveSegment(x, y);
                        //else
                        if (pathToMove && scope.editPlanMode) movePath(offsetX, offsetY);
                        else moveAllItems(offsetX, offsetY);
                        mouseDownPoint = new paper.Point(x, y);
                    }

                    function movePath(offsetX, offsetY) {
                        pathToMove.RoomObject.move(offsetX, offsetY, numberOfPointUnderMove);
                        
                    }

                    function getAnotherPoint(segment) {
                        return segment.path.segments[0].point.x === segment.point.x &&
                            segment.path.segments[0].point.y === segment.point.y ?
                            segment.path.segments[1].point : segment.path.segments[0].point;
                    }

                    function moveAllItems(offsetX, offsetY) {
                        scope.globalOffset.x += offsetX;
                        scope.globalOffset.y += offsetY;
                        scope.roomObjectCollection.updateAllPositions();
                    }

                    function selectItemByCoordinates(x, y) {
                        project.deselectAll();
                        selectedPath = null;
                        selectedSegment = null;
                        numberOfPointUnderMove = null;

                        var point = new paper.Point(x, y);
                        var table = scope.roomObjectCollection.getTableByPoint(point);
                        if (table) {
                            selectedPath = table;
                            scope.HitResult = '(' + table.position.x + ' : ' + table.position.y + ') - (' + 
                                (scope.view2ProjectX(table.position.x) - table.RoomObject.width / 2) + ' : ' +
                                (scope.view2ProjectY(table.position.y) - table.RoomObject.height / 2) + ')';
                            return;
                        }
                         
                        var hitResult = scope.roomObjectCollection.customHitTest(point, 5);
                        
                        if (!hitResult) return;
                        if (hitResult.type === 'stroke' || hitResult.type === 'screentext') {
                            selectedPath = hitResult.item;
                            //scope.HitResult = 'Line: (' + selectedPath.segments[0].point.x + ',' + selectedPath.segments[0].point.y + ') - (' +
                            //    selectedPath.segments[1].point.x + ',' + selectedPath.segments[1].point.y + ')';
                            scope.HitResult = selectedPath.RoomObject.dbCoordinatesString();
                        }
                        else if (hitResult.type === 'segment') {
                            selectedPath = hitResult.item;
                            selectedSegment = hitResult.segment;
                            numberOfPointUnderMove = hitResult.numberOfPointUnderMouse;
                            scope.HitResult = 'Segment: (' + selectedSegment.point.x + ',' + selectedSegment.point.y + ')';
                        }

                        if (selectedPath) selectedPath.selected = true;
                        if (selectedSegment) selectedSegment.selected = true;
                        //scope.LogMessage1 = 'Point: ' + point;

                    }

                    function setCurrentCoords(x, y) {
                        scope.X = x;
                        scope.Y = y;
                        scope.XProject = scope.view2ProjectX(x);
                        scope.YProject = scope.view2ProjectY(y);
                        if (!selectedPath || !selectedPath.segments || selectedPath.segments.length != 2)
                            scope.LogMessage = undefined;
                        else {
                            var segments = selectedPath.segments;
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

                    scope.view2ProjectXNoGrid = function(viewX) {
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

