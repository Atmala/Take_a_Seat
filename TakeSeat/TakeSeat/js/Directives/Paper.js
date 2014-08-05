
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint, rectangle;
                    var isDrawing = false;
                    var allFigures = [];
                    var rectangleWidth = 30, rectangleHeight = 50;

                    function mouseUp(event) {
                        isDrawing = false;
                        mouseDownPoint = undefined;
                        if (path && scope.mode === 'line') {
                            var roomObject = {
                                RoomObjectType: 'line',
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
                            allFigures.push(path);
                            scope.room.RoomObjects.push(roomObject);
                            mapProvider.SaveRoom(scope.room, function () {});
                        }
                    }

                    function mouseMove(event) {
                        setCurrentCoords(event.offsetX, event.offsetY);
                        
                        var x = event.offsetX;
                        var y = event.offsetY;
                        if (scope.mode === 'line') {
                            if (isDrawing) {
                                if (x <= 2 || y <= 2 || x >= event.currentTarget.width - 2 || y >= event.currentTarget.height - 2) {
                                    mouseUp();
                                    return;
                                }

                                path.removeSegments();
                                drawLine(mouseDownPoint, new paper.Point([x, y]));
                            }
                        } else if (scope.mode === 'table'){
                            if (rectangle) {
                                rectangle.removeSegments();
                            } else {
                                rectangle = getNewPath();
                            }
                            rectangle.moveTo(x, y);
                            rectangle.lineTo(x + rectangleWidth, y);
                            rectangle.lineTo(x + rectangleWidth, y + rectangleHeight);
                            rectangle.lineTo(x, y + rectangleHeight);
                            rectangle.lineTo(x, y);
                        } else {
                            if (mouseDownPoint) {
                                event.delta = new paper.Point(
                                    event.offsetX - mouseDownPoint.x,
                                    event.offsetY - mouseDownPoint.y);
                                var limit = 2;
                                if (event.delta.x > limit || event.delta.y > limit || event.delta.x < -limit || event.delta.y < -limit) {
                                    mouseDrag(event);
                                    mouseDownPoint.x = event.offsetX;
                                    mouseDownPoint.y = event.offsetY;
                                }
                                return;
                            }
                        }
                    }

                    function mouseDrag(event) {
                        if (mouseDownPoint) {
                            allFigures.forEach(function (figure) {
                                figure.position.x += event.delta.x;
                                figure.position.y += event.delta.y;
                            });
                            var fig = allFigures[0];
                            setCurrentCoords(fig.position.x, fig.position.y);
                        }
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
                        newPath.strokeColor = '#ACCCE2';
                        return newPath;
                    }

                    function mouseDown(event) {
                        if (scope.mode === 'line') {
                            isDrawing = true;
                            path = getNewPath();
                        } else if (scope.mode === 'table') {
                            if (rectangle) {
                                allFigures.push(rectangle);
                                rectangle = undefined;
                            }
                        }
                        mouseDownPoint = new paper.Point([event.offsetX, event.offsetY]);
                    }

                    function initPaper() {
                        paper.install(window);
                        var canvas = $('#paperCanvas');
                        paper.setup(canvas[0]);

                        initAllFigures();
                        //paper.view.draw();
                    }

                    function initAllFigures() {
                        project.activeLayer.remove();
                        scope.$watch('scope.room.RoomObjects', function () {
                            _.each(scope.room.RoomObjects, function (roomObject) {
                                var newPath = getNewPath();
                                newPath.moveTo(new paper.Point([roomObject.Points[0].X, roomObject.Points[0].Y]));
                                newPath.lineTo(new paper.Point([roomObject.Points[1].X, roomObject.Points[1].Y]));
                                allFigures.push(newPath);
                            });
                        });
                    }

                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);
