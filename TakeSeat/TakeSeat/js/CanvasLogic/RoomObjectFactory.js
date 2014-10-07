function RoomObjectFactory(scope, mapProvider) {
    this.getPathByDbRoomObject = function (dbRoomObject) {

        var roomObject = null;
        if (dbRoomObject.Points && dbRoomObject.Points.length > 0) {
            roomObject = new wallRoomObject();
        }
        if (dbRoomObject.Rectangles && dbRoomObject.Rectangles.length > 0) {
            roomObject = new tableRoomObject();
        }
        if (roomObject) {
            roomObject.loadFromDb(dbRoomObject);
            var path = roomObject.getPath();
            return path;
        }
        return null;
    }

    this.createTable = function (x, y, width, height) {
        var roomObject = new tableRoomObject();
        roomObject.createNew(x, y, width, height);
        var path = roomObject.getPath();
        return path;
    }

    this.createWall = function(path) {
        var roomObject = new wallRoomObject();
        roomObject.createNew(path);
    }

    function wallRoomObject() {
        this.RoomObjectType = 'wall';

        this.loadFromDb = function(dbRoomObject) {
            this.x1 = dbRoomObject.Points[0].X;
            this.y1 = dbRoomObject.Points[0].Y;
            this.x2 = dbRoomObject.Points[1].X;
            this.y2 = dbRoomObject.Points[1].Y;
            this.roomObjectId = dbRoomObject.Id;
        }

        this.createNew = function (path) {
            path.RoomObject = this;
            this.attachedPath = path;
            this.roomObjectId = 0;
            this.save();
        }

        this.getPath = function () {
            var path = new paper.Path();
            path.add(new paper.Point(this.x1, this.y1));
            path.add(new paper.Point(this.x2, this.y2));
            path.strokeColor = scope.color;
            path.RoomObject = this;
            this.attachedPath = path;
            return path;
        }

        this.save = function() {
            this.x1 = this.attachedPath.segments[0].point.x;
            this.y1 = this.attachedPath.segments[0].point.y;
            this.x2 = this.attachedPath.segments[1].point.x;
            this.y2 = this.attachedPath.segments[1].point.y;
            var thisObject = this;

            var lineInfo = {
                RoomObjectId: this.roomObjectId,
                X1: scope.view2ProjectX(this.x1),
                Y1: scope.view2ProjectY(this.y1),
                X2: scope.view2ProjectX(this.x2),
                Y2: scope.view2ProjectY(this.y2)
            };

            mapProvider.SaveWall(lineInfo, function (response) {
                thisObject.roomObjectId = response.Id;
            });
        }

        this.deleteRoomObject = function () {
            if (this.attachedPath.text) {
                this.attachedPath.text.remove();
                scope.loadEmployees();
            }
            mapProvider.DeleteRoomObject({ id: this.roomObjectId });
        }
    }

    function tableRoomObject() {
        this.RoomObjectType = 'table';

        this.loadFromDb = function (dbRoomObject) {
            this.leftTopX = dbRoomObject.Rectangles[0].LeftTopX;
            this.leftTopY = dbRoomObject.Rectangles[0].LeftTopY;
            this.width = dbRoomObject.Rectangles[0].Width;
            this.height = dbRoomObject.Rectangles[0].Height;
            this.roomObjectId = dbRoomObject.Id;
            this.employeeFio = dbRoomObject.EmployeeFio;
            this.employeeId = dbRoomObject.EmployeeId;
        }

        this.createNew = function(x, y, width, height) {
            this.leftTopX = x;
            this.leftTopY = y;
            this.width = width;
            this.height = height;
            var thisObject = this;

            var rectangleInfo = {
                RoomObjectId: 0,
                LeftTopX: scope.view2ProjectX(x),
                LeftTopY: scope.view2ProjectY(y),
                Width: width,
                Height: height
            };
            mapProvider.SaveTable(rectangleInfo, function(response) {
                thisObject.roomObjectId = response.Id;
            });
        }

        this.getPath = function () {
            var tablePath = new paper.Path();
            tablePath.add(new paper.Point(this.leftTopX, this.leftTopY));
            tablePath.add(new paper.Point(this.leftTopX + this.width, this.leftTopY));
            tablePath.add(new paper.Point(this.leftTopX + this.width, this.leftTopY + this.height));
            tablePath.add(new paper.Point(this.leftTopX, this.leftTopY + this.height));
            tablePath.closed = true;
            
            //var point = new paper.Point(this.leftTopX, this.leftTopY);
            //var size = new paper.Size(this.width, this.height);
            //var tablePath = new paper.Path.Rectangle(point, size);
            var smallWidth = this.width / 3;
            var smallHeight = this.height / 2;
            //tablePath.moveTo(this.leftTopX, this.leftTopY + (this.height - smallHeight) / 2);
            //tablePath.lineTo(this.leftTopX - smallWidth, this.leftTopY + (this.height - smallHeight) / 2);

            //tablePath.addChild(
            //    new Path.Rectangle(
            //        new paper.Point(
            //            this.leftTopX - smallWidth,
            //            this.leftTopY + (this.height - smallHeight) / 2),
            //        new paper.Size(smallWidth, smallHeight)
            //    ));
            tablePath.strokeColor = scope.color;
            if (this.employeeFio != '') {
                setEmployeeTableText(tablePath, this.employeeFio);
            }
            tablePath.RoomObject = this;
            this.attachedPath = tablePath;
            return tablePath;
        }

        this.deleteRoomObject = function () {
            if (this.attachedPath.text) {
                this.attachedPath.text.remove();
                scope.loadEmployees();
            }
            mapProvider.DeleteRoomObject({ id: this.roomObjectId });
        }

        this.save = function() {
            var x1 = scope.view2ProjectX(this.attachedPath.segments[0].point.x);
            var y1 = scope.view2ProjectY(this.attachedPath.segments[0].point.y);
            var x2 = scope.view2ProjectX(this.attachedPath.segments[2].point.x);
            var y2 = scope.view2ProjectY(this.attachedPath.segments[2].point.y);
            var rectangleInfo = {
                RoomObjectId: this.roomObjectId,
                LeftTopX: Math.min(x1, x2),
                LeftTopY: Math.min(y1, y2),
                Width: Math.abs(x1 - x2),
                Height: Math.abs(y1 - y2)
            };
            mapProvider.SaveTable(rectangleInfo);
        }

        function setEmployeeTableText(tableFigure, employeeFio) {
            if (tableFigure.text) {
                tableFigure.text.remove();
            }

            tableFigure.text = new PointText({
                point: [tableFigure.position.x - 18, tableFigure.position.y - 35],
                content: employeeFio,
                fillColor: scope.color,
                fontFamily: 'Courier New',
                fontWeight: 'bold',
                fontSize: 15
            });
        }
    }
}