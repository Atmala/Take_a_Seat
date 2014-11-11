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
        this.save();
    }

    this.getPath = function () {
        var path = new paper.Path();
        scope.setWallAppearance(path, this.subType);
        path.add(new paper.Point(scope.project2ViewX(this.x1), scope.project2ViewY(this.y1)));
        path.add(new paper.Point(scope.project2ViewX(this.x2), scope.project2ViewY(this.y2)));
        path.RoomObject = this;
        this.attachedPath = path;
        return path;
    }

    this.save = function () {
        this.x1 = this.attachedPath.segments[0].point.x;
        this.y1 = this.attachedPath.segments[0].point.y;
        this.x2 = this.attachedPath.segments[1].point.x;
        this.y2 = this.attachedPath.segments[1].point.y;
        var thisObject = this;

        var lineInfo = {
            RoomObjectId: this.roomObjectId,
            SubType: this.subType,
            X1: scope.view2ProjectX(this.x1),
            Y1: scope.view2ProjectY(this.y1),
            X2: scope.view2ProjectX(this.x2),
            Y2: scope.view2ProjectY(this.y2)
        };

        $.ajax({
            url: window.saveWallPath,
            type: 'POST',
            data: lineInfo,
            success: function (response) {
                thisObject.roomObjectId = response.Id;
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
}