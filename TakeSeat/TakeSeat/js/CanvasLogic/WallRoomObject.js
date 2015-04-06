﻿function WallRoomObject(scope, mapProvider) {
    this.RoomObjectType = 'wall';
    var isSelected = false, isMoving = false, isMoved = false;
    var selectedPointIndex, attachedPath, subType;
    var points = [{}, {}];
    var thisObject = this;

    this.loadFromDb = function (dbRoomObject) {
        for (var i = 0; i < 2; i++) {
            points[i].x = dbRoomObject.Points[i].X;
            points[i].y = dbRoomObject.Points[i].Y;
        }
        subType = dbRoomObject.SubType;
        this.roomObjectId = dbRoomObject.Id;
    }

    this.createByClick = function (point) {
        subType = scope.regime.subtype;

        points[0].x = scope.view2ProjectX(point.x);
        points[0].y = scope.view2ProjectY(point.y);
        points[1].x = points[0].x;
        points[1].y = points[0].y;
        selectedPointIndex = 1;
        isMoving = true;
        this.getPath();
    }

    this.onMouseUp = function () {
        if (isMoved) {
            if (lengthIsZero()) {
                if (this.roomObjectId != 0)
                    this.deleteRoomObject();
            } else {
                save();
            }
            isMoving = false;
            isMoved = false;
        }
    }

    this.onMouseDown = function () {
        isMoving = true;
    }

    function getViewPoint(index) {
        return new paper.Point(scope.project2ViewX(points[index].x),
            scope.project2ViewY(points[index].y));
    }

    function setWallAppearance() {
        switch (subType) {
            case 1:
                attachedPath.strokeWidth = 4;
                attachedPath.strokeColor = scope.wallColor;
                break;
            case 2:
                attachedPath.strokeWidth = 2;
                attachedPath.strokeColor = scope.wallColor;
                break;
        }
    }

    this.getPath = function () {
        if (attachedPath) attachedPath.remove();
        attachedPath = new paper.Path();
        setWallAppearance();
        attachedPath.add(getViewPoint(0));
        attachedPath.add(getViewPoint(1));
        attachedPath.RoomObject = this;
        return attachedPath;
    }

    function save() {
        var lineInfo = {
            RoomObjectId: thisObject.roomObjectId,
            SubType: subType,
            X1: points[0].x,
            Y1: points[0].y,
            X2: points[1].x,
            Y2: points[1].y
        };

        $.ajax({
            url: window.saveWallPath,
            type: 'POST',
            data: lineInfo,
            success: function (response) {
                thisObject.roomObjectId = response.RoomObjectId;
                points[0].x = response.X1;
                points[0].y = response.Y1;
                points[1].x = response.X2;
                points[1].y = response.Y2;
                thisObject.updatePosition();
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

    function checkTwoPointsProximity(point1, point2, tolerance) {
        return Math.abs(point1.x - point2.x) <= tolerance && Math.abs(point1.y - point2.y) <= tolerance;
    }

    function findSegment(point, tolerance) {
        for (var i = 0; i < points.length; i++) {
            if (checkTwoPointsProximity(points[i], point, tolerance)) {
                selectedPointIndex = i;
                return true;
            }
        }
        return false;
    }

    function isVerticalLine() {
        return points[0].x === points[1].x;
    }

    function isHorizontalLine() {
        return points[0].y === points[1].y;
    }

    function isBetween(a, b, c) {
        return a >= b && a <= c || a >= c && a <= b;
    }

    function checkVerticalProximity(point, tolerance) {
        return isBetween(point.y, points[0].y, points[1].y)
            && Math.abs(point.x - points[0].x) <= tolerance;
    }

    function checkHorizontalProximity(point, tolerance) {
        return isBetween(point.x, points[0].x, points[1].x)
            && Math.abs(point.y - points[0].y) <= tolerance;
    }

    function checkDiagonalProximity(point, tolerance) {
        var x1 = points[0].x;
        var y1 = points[0].y;
        var x2 = points[1].x;
        var y2 = points[1].y;
        if (!isBetween(point.x, x1, x2) || !isBetween(point.y, y1, y2))
            return false;
        var a = 1;
        var b = (x1 - x2) / (y2 - y1);
        var c = y1 * (points[0].x - x2) / (y1 - y2) - x1;
        var distance = Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);
        return distance <= tolerance;
    }

    function findLine(point, tolerance) {
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
        return Math.min(points[0].x, points[1].x);
    }

    this.top = function () {
        return Math.min(points[0].y, points[1].y);
    }

    this.right = function () {
        return Math.max(points[0].x, points[1].x);
    }

    this.bottom = function () {
        return Math.max(points[0].y, points[1].y);
    }

    function get90PointForWall(start, point) {
        if (Math.abs(point.x - start.x) > Math.abs(point.y - start.y))
            return { x: point.x, y: start.y };
        else
            return { x: start.x, y: point.y };
    }

    function getCorrectedPoint(start, point) {
        switch (scope.wallMode) {
            case '90':
                return get90PointForWall(start, point);
            default:
                return point;
        }
    }

    this.move = function (viewOffsetX, viewOffsetY) {
        if (!isMoving) return;
        isMoved = true;
        var offsetX = viewOffsetX / scope.scale;
        var offsetY = viewOffsetY / scope.scale;

        if (selectedPointIndex != undefined) {
            points[selectedPointIndex].x += offsetX;
            points[selectedPointIndex].y += offsetY;
            var correctedPoint = getCorrectedPoint(points[1 - selectedPointIndex], points[selectedPointIndex]);
            points[selectedPointIndex].x = correctedPoint.x;
            points[selectedPointIndex].y = correctedPoint.y;
        } else {
            for (var i = 0; i < points.length; i++) {
                points[i].x += offsetX;
                points[i].y += offsetY;
            }
        }
        
        this.updatePosition();
        scope.HitResult = this.dbCoordinatesString();
    }

    this.updatePosition = function () {
        attachedPath.segments[0].point = getViewPoint(0);
        attachedPath.segments[1].point = getViewPoint(1);
    }

    this.dbCoordinatesString = function () {
        return 'Wall: (' + points[0].x + ',' + points[0].y + ') - (' + points[1].x + ',' + points[1].y + ')';
    }

    this.select = function () {
        attachedPath.selected = true;
        if (selectedPointIndex != undefined)
            attachedPath.segments[selectedPointIndex].selected = true;
    }

    this.unselect = function () {
        attachedPath.selected = false;
    }

    this.isSelected = function () {
        return isSelected;
    }

    this.isMoving = function () {
        return isMoving;
    }
    
    this.selectByProjectPoint = function(point, tolerance) {
        selectedPointIndex = undefined;
        isSelected = findSegment(point, tolerance) || findLine(point, tolerance);
        if (isSelected) this.select();
        return isSelected;
    }

    this.selectByPoint = function (viewPoint, viewTolerance) {
        var point = scope.view2Project(viewPoint);
        var tolerance = viewTolerance / scope.scale;
        return this.selectByProjectPoint(point, tolerance);
    }

    function lengthIsZero() {
        return Math.abs(points[0].x - points[1].x) < scope.gridStep && Math.abs(points[0].y - points[1].y) < scope.gridStep;
    }

    function setCoordinates(newX1, newY1, newX2, newY2) {
        points[0].x = newX1;
        points[0].y = newY1;
        points[1].x = newX2;
        points[1].y = newY2;
        attachedPath = {};
    }

    this.__unittestonly__ = {
        isBetween: isBetween,
        lengthIsZero: lengthIsZero,
        setCoordinates: setCoordinates,
        getSelectedPointIndex: function () { return selectedPointIndex; },
        findSegment: findSegment
    };
}