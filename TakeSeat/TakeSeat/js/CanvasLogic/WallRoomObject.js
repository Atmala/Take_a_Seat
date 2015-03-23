﻿function WallRoomObject(scope, mapProvider) {
    this.RoomObjectType = 'wall';
    var isSelected = false;
    var numberOfPointUnderMouse, attachedPath;
    var x1, y1, x2, y2, subType;

    this.loadFromDb = function (dbRoomObject) {
        x1 = dbRoomObject.Points[0].X;
        y1 = dbRoomObject.Points[0].Y;
        x2 = dbRoomObject.Points[1].X;
        y2 = dbRoomObject.Points[1].Y;
        subType = dbRoomObject.SubType;
        this.roomObjectId = dbRoomObject.Id;
    }
    
    this.createNew = function (path) {
        path.RoomObject = this;
        attachedPath = path;
        this.roomObjectId = 0;
        subType = scope.regime.subtype;
        x1 = scope.view2ProjectX(attachedPath.segments[0].point.x);
        y1 = scope.view2ProjectY(attachedPath.segments[0].point.y);
        x2 = scope.view2ProjectX(attachedPath.segments[1].point.x);
        y2 = scope.view2ProjectY(attachedPath.segments[1].point.y);
        this.save();
    }

    function getFirstPoint () {
        return new paper.Point(scope.project2ViewX(x1), scope.project2ViewY(y1));
    }

    function getSecondPoint () {
        return new paper.Point(scope.project2ViewX(x2), scope.project2ViewY(y2));
    }

    this.getPath = function () {
        if (attachedPath) attachedPath.remove();
        if (Math.abs(x1 - x2) < scope.gridStep && Math.abs(y1 - y2) < scope.gridStep)
            return null;
        var path = new paper.Path();
        scope.setWallAppearance(path, subType);
        path.add(getFirstPoint());
        path.add(getSecondPoint());
        path.RoomObject = this;
        attachedPath = path;
        return path;
    }

    this.save = function () {
        var thisObject = this;

        var lineInfo = {
            RoomObjectId: this.roomObjectId,
            SubType: subType,
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
        $.ajax({
            url: window.deleteRoomObjectPath,
            type: 'POST',
            data: { id: this.roomObjectId },
            success: function (response) {
                attachedPath.remove();
            }
        });
    }

    function checkTwoPointsProximity (point1, point2, tolerance) {
        return Math.abs(point1.x - point2.x) <= tolerance && Math.abs(point1.y - point2.y) <= tolerance;
    }

    function findSegment (point, tolerance) {
        for (var i = 0; i < attachedPath.segments.length; i++) {
            if (checkTwoPointsProximity(attachedPath.segments[i].point, point, tolerance)) {
                numberOfPointUnderMouse = i + 1;
                return true;
            }
        }
        return false;
    }
    
    function isVerticalLine () {
        return attachedPath.segments[0].point.x == attachedPath.segments[1].point.x;
    }

    function isHorizontalLine () {
        return attachedPath.segments[0].point.y == attachedPath.segments[1].point.y;
    }

    function isBetween(a, b, c) {
        return a >= b && a <= c || a >= c && a <= b;
    }

    function checkVerticalProximity (point, tolerance) {
        return isBetween(point.y, attachedPath.segments[0].point.y, attachedPath.segments[1].point.y)
            && Math.abs(point.x - attachedPath.segments[0].point.x) <= tolerance;
    }

    function checkHorizontalProximity (point, tolerance) {
        return isBetween(point.x, attachedPath.segments[0].point.x, attachedPath.segments[1].point.x)
            && Math.abs(point.y - attachedPath.segments[0].point.y) <= tolerance;
    }

    function checkDiagonalProximity (point, tolerance) {
        var x1 = attachedPath.segments[0].point.x;
        var y1 = attachedPath.segments[0].point.y;
        var x2 = attachedPath.segments[1].point.x;
        var y2 = attachedPath.segments[1].point.y;
        if (!isBetween(point.x, x1, x2) || !isBetween(point.y, y1, y2))
            return false;
        var a = 1;
        var b = (x1 - x2) / (y2 - y1);
        var c = y1 * (x1 - x2) / (y1 - y2) - x1;
        var distance = Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);
        return distance <= tolerance;
    }

    function findLine (point, tolerance) {
        if (isVerticalLine()) {
            if (checkVerticalProximity(point, tolerance))
                return true;
        }
        else if (isHorizontalLine()) {
            if (checkHorizontalProximity(point, tolerance))
                return true;
        } else {
            if (checkDiagonalProximity(point, tolerance))
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

    function get90PointForWall (start, point) {
        if (Math.abs(point.x - start.x) > Math.abs(point.y - start.y))
            return { x: point.x, y: start.y };
        else
            return { x: start.x, y: point.y };
    }

    function getCorrectedPoint (start, point) {
        switch (scope.wallMode) {
            case '90':
                return get90PointForWall(start, point);
            default:
                return point;
        }
    }

    this.move = function (offsetX, offsetY) {
        var correctedPoint;
        if (!numberOfPointUnderMouse || numberOfPointUnderMouse == 1) {
            x1 = scope.view2ProjectX(attachedPath.segments[0].point.x + offsetX);
            y1 = scope.view2ProjectY(attachedPath.segments[0].point.y + offsetY);
            if (numberOfPointUnderMouse) {
                correctedPoint = getCorrectedPoint({ x: x2, y: y2 }, { x: x1, y: y1 });
                x1 = correctedPoint.x;
                y1 = correctedPoint.y;
            }
        }
        
        if (!numberOfPointUnderMouse || numberOfPointUnderMouse == 2) {
            x2 = scope.view2ProjectX(attachedPath.segments[1].point.x + offsetX);
            y2 = scope.view2ProjectY(attachedPath.segments[1].point.y + offsetY);
            if (numberOfPointUnderMouse) {
                correctedPoint = getCorrectedPoint({ x: x1, y: y1 }, { x: x2, y: y2 });
                x2 = correctedPoint.x;
                y2 = correctedPoint.y;
            }
        }
        this.updatePosition();
        scope.HitResult = this.dbCoordinatesString();
    }

    this.updatePosition = function() {
        attachedPath.segments[0].point = getFirstPoint();
        attachedPath.segments[1].point = getSecondPoint();
    }

    this.dbCoordinatesString = function() {
        return 'Line: (' + x1 + ',' + y1 + ') - (' + x2 + ',' + y2 + ')';
    }

    this.select = function() {
        attachedPath.selected = true;
        if (numberOfPointUnderMouse)
            attachedPath.segments[numberOfPointUnderMouse - 1].selected = true;
    }

    this.unselect = function() {
        attachedPath.selected = false;
    }

    this.isSelected = function() {
        return isSelected;
    }

    this.selectByPoint = function(point, tolerance) {
        numberOfPointUnderMouse = undefined;
        isSelected = findSegment(point, tolerance) || findLine(point, tolerance);
        if (isSelected) this.select();
        return isSelected;
    }
    
}