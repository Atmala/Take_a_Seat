
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isDrawing = false;
                    var rectangleWidth = 30, rectangleHeight = 50;
                    var color;
                    var roomObjectFactory = new RoomObjectFactory(scope, mapProvider);
                    var selectedPath, selectedSegment, pathToMove, segmentToMove;

                    scope.color = '#ACCCE2';
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
                        mouseDownPoint = undefined;
                        if (pathToMove) {
                            if (pathToMove.RoomObject.save)
                                pathToMove.RoomObject.save();
                            pathToMove = undefined;
                        }

                        if (path && scope.mode === 'line') {
                            roomObjectFactory.createWall(path);
                        }

                        if (scope.mode === 'assign') {
                            if (!scope.selectedEmployee)
                                alert("Please select Employee");
                            else {
                                assignEmployee(event.offsetX, event.offsetY);
                            }
                        }

                        if (scope.mode === 'discard') {
                            discardEmployee(event.offsetX, event.offsetY);
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
                            moveMapObjects(x, y);
                        } else {
                            selectItemByCoordinates(x, y);
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
                        if (pathToMove.text) {
                            pathToMove.text.point.x += offsetX;
                            pathToMove.text.point.y += offsetY;
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

                    function assignEmployee(x, y) {
                        clearSelection();
                        var table = getTableByCoordinates(x, y);
                        if (table) {
                            setEmployeeTableText(table, scope.selectedEmployee.FioShort);
                            saveEmployeeTableLink(scope.selectedEmployee.Id, table.RoomObject.roomObjectId);
                            scope.loadEmployees();
                        }
                    }

                    function discardEmployee(x, y) {
                        var table = getTableByCoordinates(x, y);
                        if (table) {
                            setEmployeeTableText(table, '');
                            removeEmployeeTableLink(table.dbEmployeeId, table.RoomObject.roomObjectId);
                            scope.loadEmployees();
                        }
                    }

                    function setEmployeeTableText(tableFigure, employeeFio) {
                        //tableFigure.strokeWidth = 5;
                        if (tableFigure.text) {
                            tableFigure.text.remove();
                        }

                        tableFigure.text = new PointText({
                            point: [tableFigure.position.x - 18, tableFigure.position.y - 35],
                            content: employeeFio,
                            fillColor: scope.color,
                            fontFamily: 'Courier New',
                            fontWeight: 'bold',
                            fontSize: 15
                        });
                    }

                    function saveEmployeeTableLink(employeeId, roomObjectId) {
                        var employeeTableLink = {
                            EmployeeId: employeeId,
                            RoomObjectId: roomObjectId
                        };
                        mapProvider.SaveEmployeeTableLink(employeeTableLink);
                    }

                    function removeEmployeeTableLink(employeeId, roomObjectId) {
                        var employeeTableLink = {
                            EmployeeId: employeeId,
                            RoomObjectId: roomObjectId
                        };
                        mapProvider.RemoveEmployeeTableLink(employeeTableLink);
                    }

                    function clearSelection() {
                        project.activeLayer.children.forEach(function (fig) {
                            if (fig) fig.strokeWidth = 1;
                        });
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

                    function getNewPath() {
                        var newPath = new paper.Path();
                        newPath.strokeColor = scope.color;
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
                        project.activeLayer.remove();
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

                    function view2ProjectPoint(point) {
                        return new paper.Point(view2ProjectX(point.x), view2ProjectY(point.y));
                    }

                    function project2ViewX(viewX) {
                        return viewX + globalOffset.x;
                    }

                    function project2ViewY(viewY) {
                        return viewY + globalOffset.y;
                    }

                    function project2ViewPoint(point) {
                        return new paper.Point(project2ViewX(point.x), project2ViewY(point.y));
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

                    function getTableByCoordinates(x, y) {
                        return getTableByPoint(new paper.Point(x, y));
                    }

                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);

