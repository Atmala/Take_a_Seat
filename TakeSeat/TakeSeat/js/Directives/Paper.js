
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

                            path.moveTo(start);
                            path.lineTo(new paper.Point([x, y]));

                            paper.view.draw();
                        }
                    }

                    function mouseDown(event) {
                        isDrawing = true;
                        path = new paper.Path();

                        path.strokeColor = '#ACCCE2';
                        start = new paper.Point([event.offsetX, event.offsetY]);

                    }

                    function initPaper() {
                        paper.install(window);
                        var canvas = $('#paperCanvas');
                        paper.setup(canvas[0]);
                    }

                    element.on('mousedown', mouseDown).on('mouseup', mouseUp).on('mousemove', mouseDrag);

                    $( document ).ready(function() { initPaper(); });
                }
            };
        });