
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isDrawing = false;
                    var allFigures = [];
                    var rectangleWidth = 30, rectangleHeight = 50;
                    var color = '#ACCCE2';

                    function mouseDown(event) {
                        isDrawing = true;
                        var x = event.offsetX;
                        var y = event.offsetY;

                        if (scope.mode === 'line') {
                            path = getNewPath();
                        } else if (scope.mode === 'table') {
                            path = createNewRectangle(x, y);
                        }
                        mouseDownPoint = new paper.Point([x, y]);
                    }

                    function mouseUp(event) {
                        isDrawing = false;
                        mouseDownPoint = undefined;

                        if (scope.mode != 'assign') {
                            allFigures.push(path);
                        }
                        if (path && scope.mode === 'line') {
                            var lineInfo = {
                                X1: path.segments[0].point.x,
                                Y1: path.segments[0].point.y,
                                X2: path.segments[1].point.x,
                                Y2: path.segments[1].point.y
                            };
                            mapProvider.SaveWall(lineInfo);
                        }

                        
                        if (scope.mode === 'assign') {
                            if (!scope.selectedEmployee)
                                alert("Please select Employee");
                            else {
                                clearSelection();
                                allFigures.forEach(function (fig) {
                                    var point = new paper.Point(event.offsetX, event.offsetY);
                                    if (fig.contains(point)) {
                                        setEmployeeTableText(fig, scope.selectedEmployee.FioShort);
                                        saveEmployeeTableLink(scope.selectedEmployee.Id, fig.dbRoomObjectId);
                                    }
                                });
                            }
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

                        } 
                    }

                    function setEmployeeTableText(tableFigure, employeeFio) {
                        tableFigure.strokeWidth = 5;
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

                    function clearSelection() {
                        allFigures.forEach(function (fig) {
                            if (fig != undefined) fig.strokeWidth = 1;
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
                        var point = new paper.Point(x, y);
                        var size = new paper.Size(rectangleWidth, rectangleHeight);
                        var newPath = new paper.Path.Rectangle(point, size);
                        newPath.strokeColor = color;

                        var rectangleInfo = {
                            LeftTopX: x,
                            LeftTopY: y,
                            Width: rectangleWidth,
                            Height: rectangleHeight
                        };
                        mapProvider.SaveTable(rectangleInfo);

                        return newPath;
                    }

                    function initPaper() {
                        paper.install(window);
                        var canvas = $('#paperCanvas');
                        paper.setup(canvas[0]);

                        paper.view.draw();
                    }

                    scope.initAllFigures = function () {
                        project.activeLayer.remove();
                        scope.$watch('scope.room.RoomObjects', function () {
                            _.each(scope.room.RoomObjects, function (roomObject) {
                                var newPath = getNewPath();
                                if (roomObject.Points != undefined && roomObject.Points.length > 0) {
                                    newPath.moveTo(new paper.Point([roomObject.Points[0].X, roomObject.Points[0].Y]));
                                    newPath.lineTo(new paper.Point([roomObject.Points[1].X, roomObject.Points[1].Y]));
                                    allFigures.push(newPath);
                                }
                                if (roomObject.Rectangles != undefined && roomObject.Rectangles.length > 0) {
                                    var point = new paper.Point(roomObject.Rectangles[0].LeftTopX, roomObject.Rectangles[0].LeftTopY);
                                    var size = new paper.Size(roomObject.Rectangles[0].Width, roomObject.Rectangles[0].Height);
                                    var tablePath = new paper.Path.Rectangle(point, size);
                                    tablePath.dbRoomObjectId = roomObject.Rectangles[0].RoomObjectId;
                                    tablePath.strokeColor = color;
                                    allFigures.push(tablePath);
                                }
                            });
                            paper.view.draw();
                        });
                    }

                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);
