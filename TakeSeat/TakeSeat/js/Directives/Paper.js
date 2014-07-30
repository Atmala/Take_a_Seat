
seatApp
        .directive('animate', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var path, start;
                    var isDrawing = false;

                   function canDraw() {
                       return isDrawing && scope.mode === 'line';
                   };

                    function mouseUp(event) {
                        isDrawing = false;
                    }

                    function mouseDrag(event) {
                        if (canDraw()) {
                            var x = event.offsetX;
                            var y = event.offsetY;
                            if (x <= 5 || y <= 5 || x >= event.currentTarget.width - 5 || y >= event.currentTarget.height - 5) {
                                mouseUp();
                                return;
                            }

                            path.removeSegments();

                            drawLine(start, new paper.Point([x, y]));
                        }
                    }

                    function drawLine(startPoint, endPoint) {
                        path.moveTo(startPoint);
                        path.lineTo(endPoint);

                        paper.view.draw();
                    }

                    function getNewPath() {
                        var newPath = new paper.Path();
                        newPath.strokeColor = '#ACCCE2';
                        return newPath;
                    }

                    function mouseDown(event) {
                        isDrawing = true;
                        path = getNewPath();
                        start = new paper.Point([event.offsetX, event.offsetY]);
                    }

                    function initPaper() {
                        paper.install(window);
                        var canvas = $('#paperCanvas');
                        paper.setup(canvas[0]);

                        scope.$watch('scope.lines', function() {
                            _.each(scope.lines, function(line) {
                                path = getNewPath();
                                drawLine(new paper.Point([line.X1, line.Y1]), new paper.Point([line.X2, line.Y2]));
                            });
                        });
                    }

                    element.on('mousedown', mouseDown).on('mouseup', mouseUp).on('mousemove', mouseDrag);

                    $( document ).ready(function() { initPaper(); });
                }
            };
        });