var seatApp = angular.module('seatApp', []);

seatApp.controller('Map', ['$scope', function ($scope) {
    $scope.greeting = 'Hola!';
}]);



//function PaperController($scope){

//    $scope.mode = "view";

//    $scope.Init = function() {
//        var canvas = $('#paperCanvas');
//        $scope.offset = canvas.offset();
//        paper.setup(canvas[0]);
//    }

//    $scope.mouseDown = function (event) {
//        $scope.isDrawing = true;
//        $scope.path = new paper.Path();

//        $scope.path.strokeColor = '#ACCCE2';
//        $scope.start = new paper.Point([event.offsetX, event.offsetY]);

//    };

//    $scope.mouseMove = function(event) {
//        if ($scope.isDrawing) {
//            var x = event.offsetX;
//            var y = event.offsetY;
//            if (x <= 5 || y <= 5 || x >= event.currentTarget.width-5 || y >= event.currentTarget.height-5) {
//                $scope.mouseUp();
//                return;
//            }

//            $scope.path.removeSegments();

//            $scope.path.moveTo($scope.start);
//            $scope.path.lineTo(new paper.Point([x, y]));

//            paper.view.draw();
//        }
//    };

//    $scope.mouseUp = function (event) {
//        $scope.isDrawing = false;
//    };

//};