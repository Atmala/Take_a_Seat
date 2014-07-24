

var isDrawing = false;
var start;
var path;

function onMouseMove(event) {
    if (isDrawing) {
        path.removeSegments();
        path.add(start);
        path.add(new Point(event.point));
    }
};

    function onMouseDown(event) {
        isDrawing = true;
        start = new Point(event.point);
        path = new Path.Line(start, new Point(event.point));
        path.strokeColor = '#E4141B';
        path.strokeWidth = 20;
    };

    function onMouseUp(event) {
        isDrawing = false;
    };

