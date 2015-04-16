paper.install(window);
var canvas = document.getElementById('paperCanvas');
paper.setup(canvas[0]);

function FakeScope() {
    this.wallColor = '#888888';
    this.selectedColor = 'blue';
    this.scale = 1.0;
    this.gridStep = 10;
    this.view2ProjectX = function (x) { return x; }
    this.view2ProjectY = function (y) { return y; }
    this.project2ViewX = function (x) { return x; }
    this.project2ViewY = function (y) { return y; }

    var saveWallWasCalled, deleteWallWasCalled;
    this.dbProvider = {
        saveWall: function () { saveWallWasCalled = true; },
        deleteWall: function() { deleteWallWasCalled = true; }
    };
    this._saveWallWasCalled = function () { return saveWallWasCalled; }
    this._deleteWallWasCalled = function () { return deleteWallWasCalled; }
}

QUnit.module("WallRoomObject tests");
QUnit.test("isBetween test", function (assert) {
    var obj = new WallRoomObject();
    var privateMembers = obj.getUnitTestOnlyMembers();
    assert.ok(privateMembers.isBetween(4, 3, 5));
    assert.ok(privateMembers.isBetween(5, 8, -10));
    assert.ok(!privateMembers.isBetween(1, 5, 3));
});
QUnit.test("lengthIsZero test", function(assert) {
    var scope = new FakeScope();
    scope.gridStep = 10;

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
    var obj = new WallRoomObject(new FakeScope());
    var privateMembers = obj.getUnitTestOnlyMembers();
    
    privateMembers.setCoordinates(10, 10, 100, 100);
    assert.ok(obj.selectByProjectPoint({ x: 8, y: 8 }, 5));
    assert.equal(privateMembers.getSelectedPointIndex(), 0);
});
QUnit.test("loadFromDb test", function(assert) {
    var obj = new WallRoomObject(new FakeScope());
    var dbRoomObject = {
        Points: [{ X: 10, Y: 20 }, { X: 30, Y: 40 }],
        SubType: 1,
        Id: 123
    };
    obj.loadFromDb(dbRoomObject);
    var privateMembers = obj.getUnitTestOnlyMembers();
    assert.equal(privateMembers.state.subType, 1);
    assert.equal(privateMembers.state.roomObjectId, 123);
});
QUnit.test("createByClick test", function (assert) {
    var scope = new FakeScope();
    scope.regime = { subtype: 1 };
    var obj = new WallRoomObject(scope);

    obj.createByClick({ x: 10, y: 20 });

    var privateMembers = obj.getUnitTestOnlyMembers();
    var state = privateMembers.state;
    assert.equal(state.points.length, 2);
    assert.equal(state.points[0].x, 10);
    assert.equal(state.points[0].y, 20);
    assert.equal(state.points[1].x, 10);
    assert.equal(state.points[1].y, 20);
    assert.equal(state.selectedPointIndex, 1);
    assert.ok(state.isMoving);
    assert.ok(state.paperItems.walls.length > 0);
});
QUnit.test("onMouseUp without move test", function (assert) {
    var scope = new FakeScope();
    var obj = new WallRoomObject(scope);
    var dbRoomObject = {
        Points: [{ X: 10, Y: 20 }, { X: 30, Y: 40 }],
        SubType: 1,
        Id: 123
    };

    obj.loadFromDb(dbRoomObject);
    obj.selectByProjectPoint({ x: 20, y: 30 }, 5);
    obj.onMouseDown();
    obj.onMouseUp();

    var privateMembers = obj.getUnitTestOnlyMembers();
    assert.notOk(privateMembers.state.isMoving);
    assert.notOk(privateMembers.state.isMoved);
    assert.notOk(scope._saveWallWasCalled());
    assert.notOk(scope._deleteWallWasCalled());
});
QUnit.test("onMouseUp test", function (assert) {
    var scope = new FakeScope();
    var obj = new WallRoomObject(scope);
    var dbRoomObject = {
        Points: [{ X: 10, Y: 20 }, { X: 30, Y: 40 }],
        SubType: 1,
        Id: 123
    };

    obj.loadFromDb(dbRoomObject);
    obj.selectByProjectPoint({ x: 20, y: 30 }, 5);
    obj.onMouseDown();
    obj.move(10, 10);
    obj.onMouseUp();

    var privateMembers = obj.getUnitTestOnlyMembers();
    assert.notOk(privateMembers.state.isMoving);
    assert.notOk(privateMembers.state.isMoved);
    assert.ok(scope._saveWallWasCalled());
    assert.notOk(scope._deleteWallWasCalled());
});
QUnit.test("onMouseUp with delete test", function (assert) {
    var scope = new FakeScope();
    var obj = new WallRoomObject(scope);
    var dbRoomObject = {
        Points: [{ X: 10, Y: 20 }, { X: 30, Y: 40 }],
        SubType: 1,
        Id: 123
    };

    obj.loadFromDb(dbRoomObject);
    obj.selectByProjectPoint({ x: 10, y: 20 }, 5);
    obj.onMouseDown();
    obj.move(20, 20);
    obj.onMouseUp();

    var privateMembers = obj.getUnitTestOnlyMembers();
    assert.notOk(privateMembers.state.isMoving);
    assert.notOk(privateMembers.state.isMoved);
    assert.notOk(scope._saveWallWasCalled());
    assert.ok(scope._deleteWallWasCalled());
});
QUnit.test("onMouseUp with zero length, but without delete test", function (assert) {
    var scope = new FakeScope();
    var obj = new WallRoomObject(scope);
    var dbRoomObject = {
        Points: [{ X: 10, Y: 20 }, { X: 30, Y: 40 }],
        SubType: 1,
        Id: 0
    };

    obj.loadFromDb(dbRoomObject);
    obj.selectByProjectPoint({ x: 10, y: 20 }, 5);
    obj.onMouseDown();
    obj.move(20, 20);
    obj.onMouseUp();

    var privateMembers = obj.getUnitTestOnlyMembers();
    assert.notOk(privateMembers.state.isMoving);
    assert.notOk(privateMembers.state.isMoved);
    assert.notOk(scope._saveWallWasCalled());
    assert.notOk(scope._deleteWallWasCalled());
});

