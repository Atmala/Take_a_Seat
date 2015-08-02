function WallRoomObject(scope, mapProvider) {
    this.RoomObjectType = 'wall';
    var isSelected = false, isMoving = false, isMoved = false;
    var roomObjectId, selectedPointIndex, subType;
    var paperItems = { walls: [] };
    var points = [{}, {}];

    this.getRoomObjectId = function() {
        return roomObjectId;
    }

    this.loadFromDb = function (dbRoomObject) {
        for (var i = 0; i < dbRoomObject.Points.length; i++) {
            points[i].x = roundTo10(dbRoomObject.Points[i].X);
            points[i].y = roundTo10(dbRoomObject.Points[i].Y);
        }
        subType = dbRoomObject.SubType;
        roomObjectId = dbRoomObject.Id;
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
                if (roomObjectId != 0)
                    scope.dbProvider.deleteWall(this);
            } else {
                scope.dbProvider.saveWall(this);
            }
            isMoved = false;
        }
        isMoving = false;
    }

    this.onMouseDown = function () {
        isMoving = true;
    }

    function getViewPoint(index) {
        return new paper.Point(scope.project2ViewX(points[index].x),
            scope.project2ViewY(points[index].y));
    }

    function setWallAppearance(path) {
        path.strokeWidth = subType === 1 ? 4 : 2;
        path.strokeColor = isSelected ? scope.selectedColor : scope.wallColor;
    }

    function removePaperItems() {
        if (paperItems.walls) {
            for (var i = 0; i < paperItems.walls.length; i++) {
                paperItems.walls[i].remove();
            }
        }
    }

    this.getPath = function () {
        removePaperItems();
        var path = new paper.Path();
        setWallAppearance(path);
        path.add(getViewPoint(0));
        path.add(getViewPoint(1));
        paperItems.walls.push(path);
    }

    this.getSaveArgument = function() {
        return {
            RoomObjectId: roomObjectId,
            SubType: subType,
            X1: points[0].x,
            Y1: points[0].y,
            X2: points[1].x,
            Y2: points[1].y
        };
    }

    this.onDelete = function() {
        removePaperItems();
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

    this.bounds = function() {
        return {
            left: Math.min(points[0].x, points[1].x),
            right: Math.max(points[0].x, points[1].x),
            top: Math.min(points[0].y, points[1].y),
            bottom: Math.max(points[0].y, points[1].y)
        };
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
        var offsetX = roundTo10(viewOffsetX / scope.scale);
        var offsetY = roundTo10(viewOffsetY / scope.scale);

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
        this.getPath();
    }

    this.dbCoordinatesString = function () {
        return 'Wall: (' + points[0].x + ',' + points[0].y + ') - (' + points[1].x + ',' + points[1].y + ')';
    }

    this.isSelected = function () {
        return isSelected;
    }

    this.isMoving = function () {
        return isMoving;
    }
    
    this.selectByProjectPoint = function(point, tolerance) {
        selectedPointIndex = undefined;
        var newIsSelected = findSegment(point, tolerance) || findLine(point, tolerance);
        if (newIsSelected !== isSelected) {
            isSelected = newIsSelected;
            this.getPath();
        }
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
    }

    function getState() {
        return {
            points: points,
            roomObjectId: roomObjectId,
            subType: subType,
            selectedPointIndex: selectedPointIndex,
            isMoving: isMoving,
            isMoved: isMoved,
            paperItems: paperItems
        };
    }

    this.getUnitTestOnlyMembers = function() {
        return {
            isBetween: isBetween,
            lengthIsZero: lengthIsZero,
            setCoordinates: setCoordinates,
            getSelectedPointIndex: function () { return selectedPointIndex; },
            findSegment: findSegment,
            state: getState()
        };
    }

    function roundTo10(x) {
        return Math.round(x / 10) * 10;
    }
}