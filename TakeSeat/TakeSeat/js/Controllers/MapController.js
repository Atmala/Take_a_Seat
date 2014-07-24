

function PaperController($scope){

    $scope.mode = "view";

    $scope.Init = function() {
        var canvas = $('#paperCanvas');
        $scope.offset = canvas.offset();
        paper.setup(canvas[0]);
    }

    $scope.mouseMove = function(event) {
        if ($scope.isDrawing) {
            $scope.path.removeSegments();

            $scope.path.moveTo($scope.start);
            var x = event.clientX - $scope.offset.left;
            var y = event.clientY - $scope.offset.top;
            $scope.path.lineTo($scope.start.add([x,y]));

            paper.view.draw();
        }
    };

    $scope.mouseDown = function(event) {
        $scope.isDrawing = true;
        $scope.path = new paper.Path();
       
        $scope.path.strokeColor = 'black';
        var x = event.clientX - $scope.offset.left;
        var y = event.clientY - $scope.offset.top;
        $scope.start = new paper.Point([x, y]);
     
    };

    $scope.mouseUp = function (event) {
        $scope.isDrawing = false;
    };

};

//app.directive('draw', function () {
//    return {
//        restrict: 'AEC',
//        link: function postLink(scope, element, attrs) {
//            var path;
//            var drag = false;

//            function mouseUp(event) {
//                //Clear Mouse Drag Flag
//                drag = false;
//            }

//            function mouseDrag(event) {
//                if (drag) {
//                    path.add(new paper.Point(event.layerX, event.layerY));
//                    path.smooth();
//                }
//            }

//            function mouseDown(event) {
//                //Set  flag to detect mouse drag
//                drag = true;
//                path = new paper.Path();
//                path.strokeColor = 'white';
//                path.add(new paper.Point(event.layerX, event.layerY));
//            }

//            function initPaper() {
//                paper.install(window);
//                paper.setup('canvas');
//            }

//            element.on('mousedown', mouseDown).on('mouseup', mouseUp).on('mousemove', mouseDrag);

//            initPaper();

//        }
//    };
//});