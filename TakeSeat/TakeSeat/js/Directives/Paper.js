
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isDrawing = false;
                    var rectangleWidth = 30, rectangleHeight = 50;
                    var color = '#ACCCE2';
                    var globalOffset = new paper.Point();
                    var pathToMove;

                    function mouseDown(event) {
                        isDrawing = true;
                        var x = event.offsetX;
                        var y = event.offsetY;

                        if (scope.mode === 'line') {
                            path = getNewPath();
                        } else if (scope.mode === 'table') {
                            path = createNewRectangle(x, y);
                        } else {
                            pathToMove = getTableByCoordinates(x, y);
                        }
                        mouseDownPoint = new paper.Point([x, y]);
                        
                    }

                    function mouseUp(event) {
                        isDrawing = false;
                        mouseDownPoint = undefined;
                        if (pathToMove) {
                            savePathToMove();
                            pathToMove = undefined;
                        }
                        

                        if (path && scope.mode === 'line') {
                            var lineInfo = {
                                X1: view2ProjectX(path.segments[0].point.x),
                                Y1: view2ProjectY(path.segments[0].point.y),
                                X2: view2ProjectX(path.segments[1].point.x),
                                Y2: view2ProjectY(path.segments[1].point.y)
                            };
                            mapProvider.SaveWall(lineInfo);
                        }

                        if (scope.mode === 'assign') {
                            if (!scope.selectedEmployee)
                                alert("Please select Employee");
                            else {
                                assignEmployee(event.offsetX, event.offsetY)
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

                        var hitOptions = {
                            segments: true,
                            stroke: true,
                            fill: true,
                            tolerance: 5
                        };
                        var point = new paper.Point(event.offsetX, event.offsetY);
                        var hitResult = project.hitTest(point, hitOptions);
                        scope.HitResult = hitResult;
                        scope.$apply();

                        project.deselectAll();
                        var table = getTableByCoordinates(x, y);
                        if (table) table.selected = true;

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
                            var offsetX = x - mouseDownPoint.x;
                            var offsetY = y - mouseDownPoint.y;
                            if (Math.abs(offsetX) > 2 || Math.abs(offsetY) > 2) {
                                if (pathToMove) {
                                    pathToMove.position.x += offsetX;
                                    pathToMove.position.y += offsetY;
                                    if (pathToMove.text) {
                                        pathToMove.text.point.x += offsetX;
                                        pathToMove.text.point.y += offsetY;
                                    }
                                } else {
                                    globalOffset.x += offsetX;
                                    globalOffset.y += offsetY;
                                    moveAllItems(offsetX, offsetY);
                                }
                                mouseDownPoint = new paper.Point(x, y);
                            }
                        }
                    }

                    function assignEmployee(x, y) {
                        clearSelection();
                        var table = getTableByCoordinates(x, y);
                        if (table) {
                            setEmployeeTableText(table, scope.selectedEmployee.FioShort);
                            saveEmployeeTableLink(scope.selectedEmployee.Id, table.dbRoomObjectId);
                            scope.loadEmployees();
                        }
                    }

                    function discardEmployee(x, y) {
                        var table = getTableByCoordinates(x, y);
                        if (table) {
                            setEmployeeTableText(table, '');
                            removeEmployeeTableLink(table.dbEmployeeId, table.dbRoomObjectId);
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
                            fillColor: color,
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
                        newPath.strokeColor = color;
                        return newPath;
                    }

                    function createNewRectangle(x, y) {
                        var newPath = new paper.Path.Rectangle(x, y, rectangleWidth, rectangleHeight);
                        newPath.strokeColor = color;
                        newPath.RoomObjectType = 'table';

                        var rectangleInfo = {
                            RoomObjectId: 0,
                            LeftTopX: view2ProjectX(x),
                            LeftTopY: view2ProjectY(y),
                            Width: rectangleWidth,
                            Height: rectangleHeight
                        };
                        mapProvider.SaveTable(rectangleInfo, function(response) {
                            newPath.dbRoomObjectId = response.Value;
                        });

                        return newPath;
                    }

                    function initPaper() {
                        paper.install(window);
                        var canvas = $('#paperCanvas');
                        paper.setup(canvas[0]);

                        paper.view.draw();
                    }

                    function moveAllItems(offsetX, offsetY) {
                        project.activeLayer.children.forEach(function (item) {
                            if (item.position) {
                                item.position = new paper.Point(item.position.x + offsetX, item.position.y + offsetY);
                            }
                        });
                    }

                    scope.initAllFigures = function () {
                        scope.RoomCaption = scope.room.Id;
                        project.activeLayer.remove();
                        scope.$watch('scope.room.RoomObjects', function () {
                            _.each(scope.room.RoomObjects, function (roomObject) {
                                var newPath = getNewPath();
                                newPath.RoomObjectType = 'wall';
                                if (roomObject.Points && roomObject.Points.length > 0) {
                                    newPath.moveTo(new paper.Point([roomObject.Points[0].X, roomObject.Points[0].Y]));
                                    newPath.lineTo(new paper.Point([roomObject.Points[1].X, roomObject.Points[1].Y]));
                                }
                                if (roomObject.Rectangles && roomObject.Rectangles.length > 0) {
                                    var point = new paper.Point(roomObject.Rectangles[0].LeftTopX, roomObject.Rectangles[0].LeftTopY);
                                    var size = new paper.Size(roomObject.Rectangles[0].Width, roomObject.Rectangles[0].Height);
                                    var tablePath = new paper.Path.Rectangle(point, size);
                                    tablePath.dbRoomObjectId = roomObject.Id;
                                    tablePath.RoomObjectType = 'table';
                                    tablePath.strokeColor = color;
                                    if (roomObject.EmployeeFio != '') {
                                        tablePath.dbEmployeeId = roomObject.EmployeeId;
                                        setEmployeeTableText(tablePath, roomObject.EmployeeFio);
                                    }
                                }
                            });
                            paper.view.draw();
                        });
                        scope.$apply();
                    }

                    function view2ProjectX(viewX) {
                        return viewX - globalOffset.x;
                    }

                    function view2ProjectY(viewY) {
                        return viewY - globalOffset.y;
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

                    function savePathToMove() {
                        if (!pathToMove) return;
                        if (pathToMove.RoomObjectType === 'table') {
                            var x1 = view2ProjectX(pathToMove.segments[0].point.x);
                            var y1 = view2ProjectY(pathToMove.segments[0].point.y);
                            var x2 = view2ProjectX(pathToMove.segments[2].point.x);
                            var y2 = view2ProjectY(pathToMove.segments[2].point.y);
                            var rectangleInfo = {
                                RoomObjectId: pathToMove.dbRoomObjectId,
                                LeftTopX: Math.min(x1, x2),
                                LeftTopY: Math.min(y1, y2),
                                Width: Math.abs(x1 - x2),
                                Height: Math.abs(y1 - y2)
                            };
                            mapProvider.SaveTable(rectangleInfo);
                        }
                    }
                    
                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);
