function RoomObjectCollection() {
    this.collection = [];

    this.add = function(roomObject) {
        this.collection.push(roomObject);
    }

    this.clear = function() {
        this.collection = [];
    }

    this.findRoomObjectByType = function (roomObjectType, point, tolerance) {
        for (var i = 0; i < this.collection.length; i++) {
            var roomObject = this.collection[i];
            if (roomObject.RoomObjectType === roomObjectType && roomObject.selectByPoint) {
                if (roomObject.selectByPoint(point, tolerance))
                    return roomObject;
            }
        }
        return undefined;
    }
    
    this.findRoomObject = function(point, tolerance) {
        var typePriority = ['table', 'screentext', 'wall'];
        for (var i = 0; i < typePriority.length; i++) {
            var roomObject = this.findRoomObjectByType(typePriority[i], point, tolerance);
            if (roomObject) return roomObject;
        }
        return undefined;
    }

    this.updateAllPositions = function () {
        for (var i = 0; i < this.collection.length; i++) {
            var roomObject = this.collection[i];
            if (roomObject.updatePosition) {
                roomObject.updatePosition();
            }
        };
    }

    this.getBorders = function () {
        var borders = undefined;
        for (var i = 0; i < this.collection.length; i++) {
            var roomObject = this.collection[i];
            if (!roomObject || !roomObject.bounds) continue;
            var roomObjectBounds = roomObject.bounds();

            if (!borders)
                borders = roomObjectBounds;
            else {
                if (roomObjectBounds.left < borders.left) borders.left = roomObjectBounds.left;
                if (roomObjectBounds.top < borders.top) borders.top = roomObjectBounds.top;
                if (roomObjectBounds.right > borders.right) borders.right = roomObjectBounds.right;
                if (roomObjectBounds.bottom > borders.bottom) borders.bottom = roomObjectBounds.bottom;
            }
        };
        if (borders) {
            borders.width = borders.right - borders.left + 40;
            borders.height = borders.bottom - borders.top + 40;
        }
        return borders;
    }

    this.getRoomObjectById = function (roomObjectId) {
        var index = this.getIndexById(roomObjectId);
        return index ? this.collection[index] : undefined;
    }

    this.getIndexById = function (roomObjectId) {
        for (var i = 0; i < this.collection.length; i++) {
            if (this.collection[i].roomObjectId === roomObjectId) {
                return i;
            }
        };
        return undefined;
    }
    
    this.deleteRoomObjectById = function(roomObjectId) {
        var index = this.getIndexById(roomObjectId);
        if (index) this.collection.splice(index, 1);
    }
}