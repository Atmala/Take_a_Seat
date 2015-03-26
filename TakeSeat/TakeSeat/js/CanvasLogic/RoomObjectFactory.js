function RoomObjectFactory(scope, mapProvider) {
    this.getPathByDbRoomObject = function (dbRoomObject) {

        var roomObject = null;
        if (dbRoomObject.Points && dbRoomObject.Points.length > 0) {
            roomObject = new WallRoomObject(scope, mapProvider);
        }
        if (dbRoomObject.Rectangles && dbRoomObject.Rectangles.length > 0) {
            roomObject = new TableRoomObject(scope, mapProvider);
        }
        if (dbRoomObject.ScreenTexts && dbRoomObject.ScreenTexts.length > 0) {
            roomObject = new ScreenTextObject(scope, mapProvider);
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

    this.createScreenText = function(x, y, text) {
        var roomObject = new ScreenTextObject(scope, mapProvider);
        roomObject.createNew(x, y, text);
        roomObject.getPath();
        roomObject.save();
        scope.roomObjectCollection.add(roomObject);
    }

    this.createByType = function (type) {
        var roomObject;
        switch (type) {
            case 'wall':
                roomObject = new WallRoomObject(scope, mapProvider);
                break;
            case 'table':
                roomObject = new TableRoomObject(scope, mapProvider);
                break;
            case 'text':
                roomObject = new ScreenTextObject(scope, mapProvider);
                break;
        }
        if (roomObject) scope.roomObjectCollection.add(roomObject);
        return roomObject;
    }
    
}