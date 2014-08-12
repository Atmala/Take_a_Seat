
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
                            var roomObject = {
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
                            
                            scope.room.RoomObjects.push(roomObject);
                            //mapProvider.SaveRoom(scope.room, function () {});
                        }
                       
                        if (scope.mode === 'assign') {
                            clearSelection();
                            allFigures.forEach(function(fig) {
                                var x = event.offsetX;
                                var y = event.offsetY;
                                var point = new paper.Point(x, y);
                                if (fig.contains(point)) {
                                    fig.strokeWidth = 5;
                                }
                            });
                        }
                    }

                    function clearSelection() {
                        allFigures.forEach(function (fig) {
                                fig.strokeWidth = 1;
                        });
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

                        } /*else {
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
                        }*/
                        //Can't get why do we need this, commented to simplify investigation
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
                        var x = event.offsetX;
                        var y = event.offsetY;

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

                        initAllFigures();
                        paper.view.draw();
                    }

                    function initAllFigures() {
                       /* project.activeLayer.remove();
                        scope.$watch('scope.room.RoomObjects', function () {
                            _.each(scope.room.RoomObjects, function (roomObject) {
                                var newPath = getNewPath();
                                newPath.moveTo(new paper.Point([roomObject.Points[0].X, roomObject.Points[0].Y]));
                                newPath.lineTo(new paper.Point([roomObject.Points[1].X, roomObject.Points[1].Y]));
                                allFigures.push(newPath);
                            });
                        });*/
                        //that throws on initial page load as scope.room == NULL
                    }

                    element.on('mousedown', mouseDown)
                        .on('mouseup', mouseUp)
                        .on('mousemove', mouseMove);

                    $(document).ready(function () { initPaper(); });
                }
            };
        }]);
