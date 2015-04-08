﻿paper.install(window);
var canvas = document.getElementById('paperCanvas');
paper.setup(canvas[0]);
scope = {};
scope.wallColor = '#888888';
scope.selectedColor = 'blue';
scope.view2ProjectX = function (x) { return x; }
scope.view2ProjectY = function (y) { return y; }
scope.project2ViewX = function (x) { return x; }
scope.project2ViewY = function (y) { return y; }

QUnit.module("WallRoomObject tests");
QUnit.test("isBetween test", function (assert) {
    var obj = new WallRoomObject();
    assert.ok(obj.__unittestonly__.isBetween(4, 3, 5));
    assert.ok(obj.__unittestonly__.isBetween(5, 8, -10));
    assert.ok(!obj.__unittestonly__.isBetween(1, 5, 3));
});
QUnit.test("lengthIsZero test", function(assert) {
    var scope = { gridStep: 10 };
    var obj = new WallRoomObject(scope);

    obj.__unittestonly__.setCoordinates(10, 20, 10, 20);
    assert.ok(obj.__unittestonly__.lengthIsZero());

    obj.__unittestonly__.setCoordinates(10, 20, 15, 15);
    assert.ok(obj.__unittestonly__.lengthIsZero());

    obj.__unittestonly__.setCoordinates(10, 20, 20, 10);
    assert.ok(!obj.__unittestonly__.lengthIsZero());

    obj.__unittestonly__.setCoordinates(10, 20, 10, 30);
    assert.ok(!obj.__unittestonly__.lengthIsZero());
});
QUnit.test("selectByProjectPoint test", function(assert) {
    var obj = new WallRoomObject(scope);
    
    obj.__unittestonly__.setCoordinates(10, 10, 100, 100);
    assert.ok(obj.selectByProjectPoint({ x: 8, y: 8 }, 5));
    assert.equal(obj.__unittestonly__.getSelectedPointIndex(), 0);


});