
seatApp
        .directive('animate', ['MapProvider', function (mapProvider) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, mouseDownPoint;
                    var isDrawing = false;
                    var allFigures = [];

                    function canDraw() {
                        return isDrawing && scope.mode === 'line';
                    };

                    function mouseUp(event) {
                        isDrawing = false;
                        mouseDownPoint = undefined;
                    }

                    //function move() {
                    //    if (mouseDownPoint) {
                    //        var shiftX = event.offsetX - mouseDownPoint.x;
                    //        var shiftY = event.offsetY - mouseDownPoint.y;
                    //        mouseDownPoint.x = event.offsetX;
                    //        mouseDownPoint.y = event.offsetY;
                    //        mapProvider.MoveFullImage(
                    //            { shiftX: shiftX, shiftY: shiftY },
                    //              function () {
                    //                  scope.lines = lines;
                    //              });
                    //        var lines = mapProvider.Get(function () {
                    //            scope.lines = lines;
                    //        });
                    //    }
                    //}

                    function mouseMove(event) {
                        $('#logInfo').text(event.offsetX + ' : ' + event.offsetY);
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
                        var x = event.offsetX;
                        var y = event.offsetY;
                        if (canDraw()) {
                            if (x <= 5 || y <= 5 || x >= event.currentTarget.width - 5 || y >= event.currentTarget.height - 5) {
                                mouseUp();
                                return;
                            }

                            path.removeSegments();

                            drawLine(mouseDownPoint, new paper.Point([x, y]));
                        } else {
                            
                        }
                    }

                    function mouseDrag(event) {
                        if (mouseDownPoint) {
                            allFigures.forEach(function (figure) {
                                figure.position.x += event.delta.x;
                                figure.position.y += event.delta.y;
                            });
                            var fig = allFigures[0];
                            $('#logInfo').text(fig.position.x + ' : ' + fig.position.y);
                        }
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
                        isDrawing = true;
                        path = getNewPath();
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
                                newPath.moveTo(new paper.Point([roomObject.Points[0].X, roomObject.points[0].Y]));
                                newPath.lineTo(new paper.Point([roomObject.Points[1].X, roomObject.points[1].Y]));
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
