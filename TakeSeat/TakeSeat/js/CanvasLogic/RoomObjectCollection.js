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

    this.findSegment = function(point, tolerance) {
        for (var i = 0; i < this.collection.length; i++) {
            if (this.collection[i].findSegment) {
                var hitResult = this.collection[i].findSegment(point, tolerance);
                if (hitResult) return hitResult;
            }
        }
        return undefined;
    }

    this.findLine = function(point, tolerance) {
        for (var i = 0; i < this.collection.length; i++) {
            if (this.collection[i].findLine) {
                var hitResult = this.collection[i].findLine(point, tolerance);
                if (hitResult) return hitResult;
            }
        }
        return undefined;
    }

    this.customHitTest = function(point, tolerance) {
        var segment = this.findSegment(point, tolerance);
        if (segment) return segment;
        var line = this.findLine(point, tolerance);
        return line;
    }

    this.updateAllPositions = function() {
        this.collection.forEach(function (roomObject) {
            if (roomObject.updatePosition) {
                roomObject.updatePosition();
            }
        });
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

    this.getRoomObjectById = function(roomObjectId) {
        for (var i = 0; i < this.collection.length; i++) {
            if (this.collection[i].roomObjectId === roomObjectId) {
                return this.collection[i];
            }
        };
        return undefined;
    }

}