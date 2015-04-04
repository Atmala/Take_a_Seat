QUnit.module("WallRoomObject tests");
QUnit.test("isBetween test", function (assert) {
    var obj = new WallRoomObject();
    assert.ok(obj.__unittestonly__.isBetween(4, 3, 5));
    assert.ok(obj.__unittestonly__.isBetween(5, 8, -10));
    assert.ok(!obj.__unittestonly__.isBetween(1, 5, 3));
});