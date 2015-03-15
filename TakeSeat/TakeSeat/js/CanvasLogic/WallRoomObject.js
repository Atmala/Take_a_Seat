function WallRoomObject(scope, mapProvider) {
    this.RoomObjectType = 'wall';
    var isSelected = false;
    var numberOfPointUnderMouse;
    var x1, y1, x2, y2;

    this.loadFromDb = function (dbRoomObject) {
        x1 = dbRoomObject.Points[0].X;
        y1 = dbRoomObject.Points[0].Y;
        x2 = dbRoomObject.Points[1].X;
        y2 = dbRoomObject.Points[1].Y;
        this.subType = dbRoomObject.SubType;
        this.roomObjectId = dbRoomObject.Id;
    }
    
    this.createNew = function (path) {
        path.RoomObject = this;
        this.attachedPath = path;
        this.roomObjectId = 0;
        this.subType = scope.roomObjectSubType;
        x1 = scope.view2ProjectX(this.attachedPath.segments[0].point.x);
        y1 = scope.view2ProjectY(this.attachedPath.segments[0].point.y);
        x2 = scope.view2ProjectX(this.attachedPath.segments[1].point.x);
        y2 = scope.view2ProjectY(this.attachedPath.segments[1].point.y);
        this.save();
    }

    this.getFirstPoint = function() {
        return new paper.Point(scope.project2ViewX(x1), scope.project2ViewY(y1));
    }

    this.getSecondPoint = function() {
        return new paper.Point(scope.project2ViewX(x2), scope.project2ViewY(y2));
    }

    this.getPath = function () {
        if (this.attachedPath) this.attachedPath.remove();
        if (Math.abs(x1 - x2) < scope.gridStep && Math.abs(y1 - y2) < scope.gridStep)
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
            X1: x1,
            Y1: y1,
            X2: x2,
            Y2: y2
        };

        $.ajax({
            url: window.saveWallPath,
            type: 'POST',
            data: lineInfo,
            success: function (response) {
                thisObject.roomObjectId = response.RoomObjectId;
                x1 = response.X1;
                y1 = response.Y1;
                x2 = response.X2;
                y2 = response.Y2;
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
                numberOfPointUnderMouse = i + 1;
                return true;
            }
        }
        return false;
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
                return true;
        }
        else if (this.isHorizontalLine()) {
            if (this.checkHorizontalProximity(point, tolerance))
                return true;
        } else {
            if (this.checkDiagonalProximity(point, tolerance))
                return true;
        }
        return false;
    }
    
    this.left = function () {
        return Math.min(x1, x2);
    }

    this.top = function () {
        return Math.min(y1, y2);
    }

    this.right = function () {
        return Math.max(x1, x2);
    }

    this.bottom = function () {
        return Math.max(y1, y2);
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

    this.move = function (offsetX, offsetY) {
        var correctedPoint;
        if (!numberOfPointUnderMouse || numberOfPointUnderMouse == 1) {
            x1 = scope.view2ProjectX(this.attachedPath.segments[0].point.x + offsetX);
            y1 = scope.view2ProjectY(this.attachedPath.segments[0].point.y + offsetY);
            if (numberOfPointUnderMouse) {
                correctedPoint = this.getCorrectedPoint({ x: x2, y: y2 }, { x: x1, y: y1 });
                x1 = correctedPoint.x;
                y1 = correctedPoint.y;
            }
        }
        
        if (!numberOfPointUnderMouse || numberOfPointUnderMouse == 2) {
            x2 = scope.view2ProjectX(this.attachedPath.segments[1].point.x + offsetX);
            y2 = scope.view2ProjectY(this.attachedPath.segments[1].point.y + offsetY);
            if (numberOfPointUnderMouse) {
                correctedPoint = this.getCorrectedPoint({ x: x1, y: y1 }, { x: x2, y: y2 });
                x2 = correctedPoint.x;
                y2 = correctedPoint.y;
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
        return 'Line: (' + x1 + ',' + y1 + ') - (' + x2 + ',' + y2 + ')';
    }

    this.select = function() {
        this.attachedPath.selected = true;
        if (numberOfPointUnderMouse)
            this.attachedPath.segments[numberOfPointUnderMouse - 1].selected = true;
    }

    this.unselect = function() {
        this.attachedPath.selected = false;
    }

    this.isSelected = function() {
        return isSelected;
    }

    this.selectByPoint = function(point, tolerance) {
        numberOfPointUnderMouse = undefined;
        isSelected = this.findSegment(point, tolerance) || this.findLine(point, tolerance);
        if (isSelected) this.select();
        return isSelected;
    }
    
}