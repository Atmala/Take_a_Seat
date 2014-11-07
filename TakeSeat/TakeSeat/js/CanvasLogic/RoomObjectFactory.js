function RoomObjectFactory(scope, mapProvider) {
    this.getPathByDbRoomObject = function (dbRoomObject) {

        var roomObject = null;
        if (dbRoomObject.Points && dbRoomObject.Points.length > 0) {
            roomObject = new WallRoomObject();
        }
        if (dbRoomObject.Rectangles && dbRoomObject.Rectangles.length > 0) {
            roomObject = new TableRoomObject();
        }
        if (roomObject) {
            roomObject.loadFromDb(dbRoomObject);
            var path = roomObject.getPath();
            return path;
        }
        return null;
    }

    this.createTable = function (x, y, width, height) {
        var roomObject = new TableRoomObject();
        roomObject.createNew(x, y, width, height);
        var path = roomObject.getPath();
        return path;
    }

    this.createWall = function(path) {
        var roomObject = new WallRoomObject();
        roomObject.createNew(path);
    }
}