function RoomObjectFactory(scope, mapProvider) {
    this.getPathByDbRoomObject = function (dbRoomObject) {

        var roomObject = null;
        if (dbRoomObject.Points && dbRoomObject.Points.length > 0) {
            roomObject = new WallRoomObject(scope, mapProvider);
        }
        if (dbRoomObject.Rectangles && dbRoomObject.Rectangles.length > 0) {
            roomObject = new TableRoomObject(scope, mapProvider);
        }
        if (roomObject) {
            roomObject.loadFromDb(dbRoomObject);
            var path = roomObject.getPath();
            if (path) scope.roomObjectCollection.add(roomObject);
            return path;
        }
        return null;
    }

    this.createTable = function (x, y, width, height) {
        var roomObject = new TableRoomObject(scope, mapProvider);
        roomObject.createNew(x, y, width, height);
        var path = roomObject.getPath();
        scope.roomObjectCollection.add(roomObject);
        return path;
    }

    this.createWall = function(path) {
        var roomObject = new WallRoomObject(scope, mapProvider);
        roomObject.createNew(path);
        scope.roomObjectCollection.add(roomObject);
    }

    this.createScreenText = function(x, y, text) {
        var roomObject = new ScreenTextObject(scope, mapProvider);
        roomObject.createNew(x, y, text);
        roomObject.getPath();
        roomObject.save();
        scope.roomObjectCollection.add(roomObject);
    }
}