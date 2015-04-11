paper.install(window);
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
    var privateMembers = obj.getUnitTestOnlyMembers();
    assert.ok(privateMembers.isBetween(4, 3, 5));
    assert.ok(privateMembers.isBetween(5, 8, -10));
    assert.ok(!privateMembers.isBetween(1, 5, 3));
});
QUnit.test("lengthIsZero test", function(assert) {
    var scope = { gridStep: 10 };
    var obj = new WallRoomObject(scope);
    var privateMembers = obj.getUnitTestOnlyMembers();

    privateMembers.setCoordinates(10, 20, 10, 20);
    assert.ok(privateMembers.lengthIsZero());

    privateMembers.setCoordinates(10, 20, 15, 15);
    assert.ok(privateMembers.lengthIsZero());

    privateMembers.setCoordinates(10, 20, 20, 10);
    assert.ok(!privateMembers.lengthIsZero());

    privateMembers.setCoordinates(10, 20, 10, 30);
    assert.ok(!privateMembers.lengthIsZero());
});
QUnit.test("selectByProjectPoint test", function(assert) {
    var obj = new WallRoomObject(scope);
    var privateMembers = obj.getUnitTestOnlyMembers();
    
    privateMembers.setCoordinates(10, 10, 100, 100);
    assert.ok(obj.selectByProjectPoint({ x: 8, y: 8 }, 5));
    assert.equal(privateMembers.getSelectedPointIndex(), 0);


});