
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isDrawing = false, isMoved = false;
                    var rectangleWidth = 70, rectangleHeight = 100;
                    var roomObjectFactory = new RoomObjectFactory(scope, mapProvider);
                    var selectedPath, selectedSegment, pathToMove, segmentToMove;

                    scope.color = '#000000';
                    scope.fontColor = '#ffffff';
                    scope.wallColor = '#888888';
                    scope.foundColor = '#66FF33';
                    scope.globalOffset = new paper.Point();

                    function mouseDown(event) {
                        isDrawing = true;
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
                        isDrawing = false;
                        
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

                        if (scope.mode === 'line' && isDrawing) {
                            if (x <= 2 || y <= 2 || x >= event.currentTarget.width - 2 || y >= event.currentTarget.height - 2) {
                                mouseUp();
                                return;
                            }

                            path.removeSegments();
                            drawLine(mouseDownPoint, new paper.Point([x, y]));

                        } else if (scope.mode === 'table' && isDrawing) {
                            path.position = new paper.Point([x, y]);
                        } else if (scope.mode === 'view' && mouseDownPoint) {
                            if (Math.abs(x - mouseDownPoint.x) > 0 || Math.abs(y - mouseDownPoint.y) > 0) {
                                isMoved = true;
                                moveMapObjects(x, y);
                            }
                        } else {
                            selectItemByCoordinates(x, y);
                            if (!selectedPath || ! (selectedPath.RoomObject.RoomObjectType === 'table')) {
                                $("#tableDropDownMenu").css({visibility: 'hidden'});
                            }
                        }
                    }

                    function moveMapObjects(x, y) {
                        var offsetX = x - mouseDownPoint.x;
                        var offsetY = y - mouseDownPoint.y;
                        if (Math.abs(offsetX) < 2 && Math.abs(offsetY) < 2) return;

                        if (segmentToMove) moveSegment(offsetX, offsetY);
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

                    function moveSegment(offsetX, offsetY) {
                        segmentToMove.point.x += offsetX;
                        segmentToMove.point.y += offsetY;
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
                        scope.$apply();

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
                        scope.$apply();
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
                        scope.globalOffset = new paper.Point(0, 0);
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
                        return viewX - scope.globalOffset.x;
                    }

                    scope.view2ProjectY = function(viewY) {
                        return viewY - scope.globalOffset.y;
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

                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);

