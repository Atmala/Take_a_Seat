﻿

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

/*

// Adapted from the following Processing example:
// http://processing.org/learning/topics/follow3.html

// The amount of points in the path:
var points = 25;

// The distance between the points:
var length = 35;

var path = new Path({
    strokeColor: '#E4141B',
    strokeWidth: 20,
    strokeCap: 'round'
});

var start = view.center / [10, 1];
for (var i = 0; i < points; i++)
    path.add(start + new Point(i * length, 0));

function onMouseMove(event) {
    path.firstSegment.point = event.point;
    for (var i = 0; i < points - 1; i++) {
        var segment = path.segments[i];
        var nextSegment = segment.next;
        var vector = segment.point - nextSegment.point;
        vector.length = length;
        nextSegment.point = segment.point - vector;
    }
    path.smooth();
}

function onMouseDown(event) {
    path.fullySelected = true;
    path.strokeColor = '#e08285';
}

function onMouseUp(event) {
    path.fullySelected = false;
    path.strokeColor = '#e4141b';
}*/