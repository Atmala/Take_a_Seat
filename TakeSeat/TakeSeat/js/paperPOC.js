

$(document).ready(function() {
   // var path = new Path();

    $('.paperCanvas').mousedown(function(e) {
        alert("start");
        // Give the stroke a color
        path.strokeColor = 'black';
        var start = new Point(e.offsetX, e.offsetY);
        path.moveTo(start);
    });

    $('.paperCanvas').mousedown(function(e) {
        path.add(new Point(e.offsetX, e.offsetY));
    });
});