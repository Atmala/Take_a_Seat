
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint, rectangle;
                    var isDrawing = false;
                    var allFigures = [];
                    var rectangleWidth = 30, rectangleHeight = 50;
                    var color = '#ACCCE2';

                    function mouseUp(event) {
                        isDrawing = false;
                        mouseDownPoint = undefined;

                        if (scope.mode != 'assign') {
                            allFigures.push(path);
                        }
                        if (path && scope.mode === 'line') {
                            scope.room.RoomObjects.push(getLine());
                        }

                        if (scope.mode === 'assign') {
                            if (!scope.selectedEmployee)
                                alert("Please select Employee");
                            else {
                                clearSelection();
                                allFigures.forEach(function (fig) {
                                    var x = event.offsetX;
                                    var y = event.offsetY;
                                    var point = new paper.Point(x, y);
                                    if (fig.contains(point)) {

                                        fig.strokeWidth = 5;
                                        if (!fig.tag) {
                                            var table = getTable();
                                            fig.tag = table;
                                            scope.room.RoomObjects.push(table);
                                        }
                                        if (fig.text) {
                                            fig.text.remove();
                                            fig.tag.EmployeeId = scope.selectedEmployee.Id;
                                        }

                                        fig.text = new PointText({
                                            point: [fig.position.x - 18, fig.position.y - 35],
                                            content: scope.selectedEmployee.FioShort,
                                            fillColor: color,
                                            fontFamily: 'Courier New',
                                            fontWeight: 'bold',
                                            fontSize: 15
                                        });

                                    }
                                });
                            }
                        }
                    }

                    function getLine() {
                        return {
                            RoomObjectTypeStr: 'wall',
                            Points: [
                            {
                                //Id: 0,
                                X: path.segments[0].point.x,
                                Y: path.segments[0].point.y,
                                //Order: 1
                            },
                            {
                                //Id: 0,
                                X: path.segments[1].point.x,
                                Y: path.segments[1].point.y,
                                //Order: 2
                            }]
                        };
                    }

                    function getTable() {
                        return {
                            RoomObjectTypeStr: 'table',
                            Points: [
                            {
                                //Id: 0,
                                X: path.segments[0].point.x,
                                Y: path.segments[0].point.y,
                                //Order: 1
                            },
                            {
                                //Id: 0,
                                X: path.segments[1].point.x,
                                Y: path.segments[1].point.y,
                                //Order: 2
                            },
                            {
                                //Id: 0,
                                X: path.segments[2].point.x,
                                Y: path.segments[2].point.y,
                                //Order: 2
                            },
                            {
                                //Id: 0,
                                X: path.segments[3].point.x,
                                Y: path.segments[3].point.y,
                                //Order: 2
                            }],
                            EmployeeId: scope.selectedEmployee.Id
                        };
                    }

                    function clearSelection() {
                        allFigures.forEach(function (fig) {
                            fig.strokeWidth = 1;
                        });
                    }

                    function mouseMove(event) {
                        setCurrentCoords(event.offsetX, event.offsetY);

                        var viewPosition = paper.view.viewToProject(new paper.Point(event.offsetX, event.offsetY));
                        var x = viewPosition.x;
                        var y = viewPosition.y;
                        if (scope.mode === 'line' && isDrawing) {
                            if (x <= 2 || y <= 2 || x >= event.currentTarget.width - 2 || y >= event.currentTarget.height - 2) {
                                mouseUp();
                                return;
                            }

                            path.removeSegments();
                            drawLine(mouseDownPoint, new paper.Point([x, y]));

                        } else if (scope.mode === 'table' && isDrawing) {

                            path.position = new paper.Point([x, y]);

                        } else {
                            if (mouseDownPoint) {
                                event.delta = new paper.Point(
                                    x - mouseDownPoint.x,
                                    y - mouseDownPoint.y);
                                var limit = 2;
                                if (event.delta.x > limit || event.delta.y > limit || event.delta.x < -limit || event.delta.y < -limit) {
                                    paper.view.center = new paper.Point(
                                        paper.view.center.x - event.delta.x,
                                        paper.view.center.y - event.delta.y);
                                    mouseDownPoint.x = x;
                                    mouseDownPoint.y = y;
                                }
                                return;
                            }
                        }
                    }

                    function setCurrentCoords(x, y) {
                        scope.X = view.center.x;
                        scope.Y = view.center.y;
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

                    function getNewRectangle(x, y) {
                        var point = new paper.Point(x, y);
                        var size = new paper.Size(rectangleWidth, rectangleHeight);
                        var newPath = new paper.Path.Rectangle(point, size);
                        newPath.strokeColor = color;
                        return newPath;
                    }

                    function mouseDown(event) {
                        isDrawing = true;
                        var viewPosition = paper.view.viewToProject(new paper.Point(event.offsetX, event.offsetY));
                        var x = viewPosition.x;
                        var y = viewPosition.y;

                        if (scope.mode === 'line') {
                            path = getNewPath();
                        } else if (scope.mode === 'table') {
                            path = getNewRectangle(x, y);
                        }
                        mouseDownPoint = new paper.Point([x, y]);
                    }

                    function initPaper() {
                        paper.install(window);
                        var canvas = $('#paperCanvas');
                        paper.setup(canvas[0]);
                        paper.view.draw();
                    }

                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);
