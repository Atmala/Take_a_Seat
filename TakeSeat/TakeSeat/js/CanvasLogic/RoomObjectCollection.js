function RoomObjectCollection() {
    this.collection = [];

    this.add = function(roomObject) {
        this.collection.push(roomObject);
    }

    this.clear = function() {
        this.collection = [];
    }

    this.getTableByPoint = function(point) {
        for (var i = 0; i < this.collection.length; i++) {
            if (this.collection[i].attachedPath && this.collection[i].attachedPath.contains(point)) {
                return this.collection[i].attachedPath;
            }
        }
        return undefined;
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
        var borders;
        for (var i = 0; i < this.collection.length; i++) {
            var roomObject = this.collection[i];
            if (!roomObject) continue;

            if (!borders)
                borders = { left: roomObject.left(), top: roomObject.top(), right: roomObject.right(), bottom: roomObject.bottom() };
            else {
                if (roomObject.left() < borders.left) borders.left = roomObject.left();
                if (roomObject.top() < borders.top) borders.top = roomObject.top();
                if (roomObject.right() > borders.right) borders.right = roomObject.right();
                if (roomObject.bottom() > borders.bottom) borders.bottom = roomObject.bottom();
            }
        };
        borders.width = borders.right - borders.left + 40;
        borders.height = borders.bottom - borders.top + 40;
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
        if (index) this.collection.splice(index);
    }
}