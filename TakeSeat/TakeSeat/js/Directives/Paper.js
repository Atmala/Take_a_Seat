
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isMoved = false;
                    var rectangleWidth = 70, rectangleHeight = 100;
                    var roomObjectFactory = new RoomObjectFactory(scope, mapProvider);
                    var selectedPath, selectedSegment, pathToMove, segmentToMove;

                    scope.color = '#000000';
                    scope.fontColor = '#ffffff';
                    scope.wallColor = '#888888';
                    scope.foundColor = '#66FF33';
                    scope.globalOffset = new paper.Point();
                    scope.scale = 1.0;

                    function mouseDown(event) {
                        var x = event.offsetX;
                        var y = event.offsetY;

                        if (scope.mode === 'line') {
                            path = getNewPath();
                        } else if (scope.mode === 'table') {
                            path = roomObjectFactory.createTable(x, y, rectangleWidth, rectangleHeight);
                        } else if (scope.mode === 'delete') {
                            if (selectedPath) {
                                selectedPath.RoomObject.deleteRoomObject();
                                selectedPath.remove();
                            }
                        } else {
                            pathToMove = selectedPath;
                            segmentToMove = selectedSegment;
                        }

                        if (scope.mode !== 'delete') {
                            mouseDownPoint = new paper.Point([x, y]);
                        }
                    }

                    function mouseUp(event) {
                        if (pathToMove) {
                            if (isMoved) {
                                if (pathToMove.RoomObject.save)
                                    pathToMove.RoomObject.save();
                                pathToMove = undefined;
                            } else {
                                if (pathToMove.RoomObject.showDropDownMenu)
                                    pathToMove.RoomObject.showDropDownMenu();
                            }
                        }
                        mouseDownPoint = undefined;
                        isMoved = false;

                        if (path && scope.mode === 'line') {
                            roomObjectFactory.createWall(path);
                        }
                    }

                    function mouseMove(event) {
                        setCurrentCoords(event.offsetX, event.offsetY);

                        var x = event.offsetX;
                        var y = event.offsetY;

                        if (scope.mode === 'line' && mouseDownPoint) {
                            if (x <= 2 || y <= 2 || x >= event.currentTarget.width - 2 || y >= event.currentTarget.height - 2) {
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
                            selectItemByCoordinates(x, y);
                            if (!selectedPath || !(selectedPath.RoomObject.RoomObjectType === 'table')) {
                                scope.tableDropDownMenuVisible = false;
                            }
                        }
                        scope.$apply();
                    }

                    function moveMapObjects(x, y) {
                        var offsetX = x - mouseDownPoint.x;
                        var offsetY = y - mouseDownPoint.y;
                        if (Math.abs(offsetX) < 2 && Math.abs(offsetY) < 2) return;

                        if (segmentToMove) moveSegment(x, y);
                        else if (pathToMove) movePath(offsetX, offsetY);
                        else moveAllItems(offsetX, offsetY);
                        mouseDownPoint = new paper.Point(x, y);
                    }

                    function movePath(offsetX, offsetY) {
                        pathToMove.position.x += offsetX;
                        pathToMove.position.y += offsetY;
                        if (pathToMove.captions) {
                            for (var i = 0; i < pathToMove.captions.length; i++) {
                                pathToMove.captions[i].point.x += offsetX;
                                pathToMove.captions[i].point.y += offsetY;
                            }
                        }
                    }

                    function getAnotherPoint(segment) {
                        return segment.path.segments[0].point.x === segment.point.x &&
                            segment.path.segments[0].point.y === segment.point.y ?
                            segment.path.segments[1].point : segment.path.segments[0].point;
                    }

                    function moveSegment(x, y) {
                        var anotherPoint = getAnotherPoint(segmentToMove);
                        var point = new paper.Point(x, y);
                        var correctedPoint = getPointForWall(anotherPoint, point, scope.wallMode);
                        segmentToMove.point.x = correctedPoint.x;
                        segmentToMove.point.y = correctedPoint.y;
                    }

                    function moveAllItems(offsetX, offsetY) {
                        scope.globalOffset.x += offsetX;
                        scope.globalOffset.y += offsetY;
                        project.activeLayer.children.forEach(function (item) {
                            if (item.position) {
                                item.position = new paper.Point(item.position.x + offsetX, item.position.y + offsetY);
                            }
                        });
                    }

                    function selectItemByCoordinates(x, y) {
                        project.deselectAll();
                        selectedPath = null;
                        selectedSegment = null;

                        var point = new paper.Point(x, y);
                        var table = getTableByPoint(point);
                        if (table) {
                            selectedPath = table;
                            return;
                        }

                        var hitOptions = {
                            segments: true,
                            stroke: true,
                            fill: false,
                            tolerance: 5
                        };

                        var hitResult = project.hitTest(point, hitOptions);
                        scope.HitResult = hitResult;
                        //scope.$apply();

                        if (!hitResult) return;
                        if (hitResult.type === 'stroke') {
                            selectedPath = hitResult.item;
                        }
                        else if (hitResult.type === 'segment') {
                            selectedPath = hitResult.item;
                            selectedSegment = hitResult.segment;
                        }
                        
                        if (selectedPath) selectedPath.selected = true;
                        if (selectedSegment) selectedSegment.selected = true;
                    }

                    function setCurrentCoords(x, y) {
                        scope.X = x;
                        scope.Y = y;
                        //scope.$apply();
                    }

                    function drawLine(startPoint, endPoint) {
                        path.moveTo(startPoint);
                        path.lineTo(endPoint);
                    }

                    scope.setWallAppearance = function(wallPath, subtype) {
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
                        //scope.globalOffset = new paper.Point(0, 0);
                        if (project.activeLayer) project.activeLayer.remove();
                        scope.$watch('scope.room.RoomObjects', function () {
                            _.each(scope.room.RoomObjects, function (roomObject) {
                                roomObjectFactory.getPathByDbRoomObject(roomObject);
                            });
                            paper.view.draw();
                        });
                        scope.$apply();
                    }

                    scope.view2ProjectX = function(viewX) {
                        return Math.round(viewX / scope.scale - scope.globalOffset.x);
                    }

                    scope.view2ProjectY = function(viewY) {
                        return Math.round(viewY / scope.scale - scope.globalOffset.y);
                    }

                    scope.project2ViewX = function(projectX) {
                        return Math.round(projectX * scope.scale + scope.globalOffset.x);
                    }

                    scope.project2ViewY = function (projectY) {
                        return Math.round(projectY * scope.scale + scope.globalOffset.y);
                    }

                    function getTableByPoint(point) {
                        for (var i = 0; i < project.activeLayer.children.length; i++) {
                            var item = project.activeLayer.children[i];
                            if (item.contains(point)) {
                                return item;
                            }
                        }
                        return undefined;
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

                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);

