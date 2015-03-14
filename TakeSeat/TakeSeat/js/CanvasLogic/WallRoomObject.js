function WallRoomObject(scope, mapProvider) {
    this.RoomObjectType = 'wall';

    this.loadFromDb = function (dbRoomObject) {
        this.x1 = dbRoomObject.Points[0].X;
        this.y1 = dbRoomObject.Points[0].Y;
        this.x2 = dbRoomObject.Points[1].X;
        this.y2 = dbRoomObject.Points[1].Y;
        this.subType = dbRoomObject.SubType;
        this.roomObjectId = dbRoomObject.Id;
    }

    this.createNew = function (path) {
        path.RoomObject = this;
        this.attachedPath = path;
        this.roomObjectId = 0;
        this.subType = scope.roomObjectSubType;
        this.x1 = scope.view2ProjectX(this.attachedPath.segments[0].point.x);
        this.y1 = scope.view2ProjectY(this.attachedPath.segments[0].point.y);
        this.x2 = scope.view2ProjectX(this.attachedPath.segments[1].point.x);
        this.y2 = scope.view2ProjectY(this.attachedPath.segments[1].point.y);
        this.save();
    }

    this.getFirstPoint = function() {
        return new paper.Point(scope.project2ViewX(this.x1), scope.project2ViewY(this.y1));
    }

    this.getSecondPoint = function() {
        return new paper.Point(scope.project2ViewX(this.x2), scope.project2ViewY(this.y2));
    }

    this.getPath = function () {
        if (this.attachedPath) this.attachedPath.remove();
        if (Math.abs(this.x1 - this.x2) < scope.gridStep && Math.abs(this.y1 - this.y2) < scope.gridStep)
            return null;
        var path = new paper.Path();
        scope.setWallAppearance(path, this.subType);
        path.add(this.getFirstPoint());
        path.add(this.getSecondPoint());
        path.RoomObject = this;
        this.attachedPath = path;
        return path;
    }

    this.save = function () {
        var thisObject = this;

        var lineInfo = {
            RoomObjectId: this.roomObjectId,
            SubType: this.subType,
            X1: this.x1,
            Y1: this.y1,
            X2: this.x2,
            Y2: this.y2
        };

        $.ajax({
            url: window.saveWallPath,
            type: 'POST',
            data: lineInfo,
            success: function (response) {
                thisObject.roomObjectId = response.RoomObjectId;
                thisObject.x1 = response.X1;
                thisObject.y1 = response.Y1;
                thisObject.x2 = response.X2;
                thisObject.y2 = response.Y2;
                thisObject.attachedPath.segments[0].point = thisObject.getFirstPoint();
                thisObject.attachedPath.segments[1].point = thisObject.getSecondPoint();
            }
        });
    }

    this.deleteRoomObject = function () {
        if (this.attachedPath.text) {
            this.attachedPath.text.remove();
            scope.loadEmployees();
        }
        $.ajax({
            url: window.deleteRoomObjectPath,
            type: 'POST',
            data: { id: this.roomObjectId }
        });
    }

    this.checkTwoPointsProximity = function(point1, point2, tolerance) {
        return Math.abs(point1.x - point2.x) <= tolerance && Math.abs(point1.y - point2.y) <= tolerance;
    }

    this.findSegment = function (point, tolerance) {
        for (var i = 0; i < this.attachedPath.segments.length; i++) {
            if (this.checkTwoPointsProximity(this.attachedPath.segments[i].point, point, tolerance)) {
                return {
                    type: 'segment',
                    item: this.attachedPath,
                    segment: this.attachedPath.segments[i],
                    numberOfPointUnderMouse: i + 1
                }
            }
        }
        this.numberOfPointUnderMouse = undefined;
        return undefined;
    }

    this.isVerticalLine = function() {
        return this.attachedPath.segments[0].point.x == this.attachedPath.segments[1].point.x;
    }

    this.isHorizontalLine = function () {
        return this.attachedPath.segments[0].point.y == this.attachedPath.segments[1].point.y;
    }

    function isBetween(a, b, c) {
        return a >= b && a <= c || a >= c && a <= b;
    }

    this.checkVerticalProximity = function(point, tolerance) {
        return isBetween(point.y, this.attachedPath.segments[0].point.y, this.attachedPath.segments[1].point.y)
            && Math.abs(point.x - this.attachedPath.segments[0].point.x) <= tolerance;
    }

    this.checkHorizontalProximity = function (point, tolerance) {
        return isBetween(point.x, this.attachedPath.segments[0].point.x, this.attachedPath.segments[1].point.x)
            && Math.abs(point.y - this.attachedPath.segments[0].point.y) <= tolerance;
    }

    this.checkDiagonalProximity = function(point, tolerance) {
        var x1 = this.attachedPath.segments[0].point.x;
        var y1 = this.attachedPath.segments[0].point.y;
        var x2 = this.attachedPath.segments[1].point.x;
        var y2 = this.attachedPath.segments[1].point.y;
        if (!isBetween(point.x, x1, x2) || !isBetween(point.y, y1, y2))
            return false;
        var a = 1;
        var b = (x1 - x2) / (y2 - y1);
        var c = y1 * (x1 - x2) / (y1 - y2) - x1;
        var distance = Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);
        return distance <= tolerance;
    }

    this.findLine = function (point, tolerance) {
        if (this.isVerticalLine()) {
            if (this.checkVerticalProximity(point, tolerance))
                return { type: 'stroke', item: this.attachedPath };
        }
        else if (this.isHorizontalLine()) {
            if (this.checkHorizontalProximity(point, tolerance))
                return { type: 'stroke', item: this.attachedPath };
        } else {
            if (this.checkDiagonalProximity(point, tolerance))
                return { type: 'stroke', item: this.attachedPath };
        }
        return undefined;   
    }

    this.left = function () {
        return Math.min(this.x1, this.x2);
    }

    this.top = function () {
        return Math.min(this.y1, this.y2);
    }

    this.right = function () {
        return Math.max(this.x1, this.x2);
    }

    this.bottom = function () {
        return Math.max(this.y1, this.y2);
    }

    this.get90PointForWall = function(start, point) {
        if (Math.abs(point.x - start.x) > Math.abs(point.y - start.y))
            return { x: point.x, y: start.y };
        else
            return { x: start.x, y: point.y };
    }

    this.getCorrectedPoint = function(start, point) {
        switch (scope.wallMode) {
            case '90':
                return this.get90PointForWall(start, point);
            default:
                return point;
        }
    }

    this.move = function (offsetX, offsetY, numberOfPointUnderMouse) {
        this.numberOfPointUnderMouse = numberOfPointUnderMouse;
        var correctedPoint;
        if (!numberOfPointUnderMouse || numberOfPointUnderMouse == 1) {
            this.x1 = scope.view2ProjectX(this.attachedPath.segments[0].point.x + offsetX);
            this.y1 = scope.view2ProjectY(this.attachedPath.segments[0].point.y + offsetY);
            if (numberOfPointUnderMouse) {
                correctedPoint = this.getCorrectedPoint({ x: this.x2, y: this.y2 }, { x: this.x1, y: this.y1 });
                this.x1 = correctedPoint.x;
                this.y1 = correctedPoint.y;
            }
        }
        if (!numberOfPointUnderMouse || numberOfPointUnderMouse == 2) {
            this.x2 = scope.view2ProjectX(this.attachedPath.segments[1].point.x + offsetX);
            this.y2 = scope.view2ProjectY(this.attachedPath.segments[1].point.y + offsetY);
            if (numberOfPointUnderMouse) {
                correctedPoint = this.getCorrectedPoint({ x: this.x1, y: this.y1 }, { x: this.x2, y: this.y2 });
                this.x2 = correctedPoint.x;
                this.y2 = correctedPoint.y;
            }
        }
        this.updatePosition();
        scope.HitResult = this.dbCoordinatesString();
    }

    this.updatePosition = function() {
        this.attachedPath.segments[0].point = this.getFirstPoint();
        this.attachedPath.segments[1].point = this.getSecondPoint();
    }

    this.dbCoordinatesString = function() {
        return 'Line: (' + this.x1 + ',' + this.y1 + ') - (' + this.x2 + ',' + this.y2 + ')';
    }

    this.select = function() {
        this.attachedPath.selected = true;
        if (numberOfPointUnderMouse)
            this.attachedPath.segments[this.numberOfPointUnderMouse - 1].selected = true;
    }
}