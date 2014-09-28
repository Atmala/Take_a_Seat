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

    function wallRoomObject() {
        this.RoomObjectType = 'wall';

        this.loadFromDb = function(dbRoomObject) {
            this.x1 = dbRoomObject.Points[0].X;
            this.y1 = dbRoomObject.Points[0].Y;
            this.x2 = dbRoomObject.Points[1].X;
            this.y2 = dbRoomObject.Points[1].Y;
        }

        this.getPath = function () {
            var path = new paper.Path();
            path.moveTo(new paper.Point(this.x1, this.y1));
            path.lineTo(new paper.Point(this.x2, this.y2));
            path.strokeColor = scope.color;
            path.RoomObject = this;
            this.attachedPath = path;
            return path;
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

            var rectangleInfo = {
                RoomObjectId: 0,
                LeftTopX: scope.view2ProjectX(x),
                LeftTopY: scope.view2ProjectY(y),
                Width: width,
                Height: height
            };
            mapProvider.SaveTable(rectangleInfo, function (response) {
                this.roomObjectId = response.Id;
            });
        }

        this.getPath = function () {
            var point = new paper.Point(this.leftTopX, this.leftTopY);
            var size = new paper.Size(this.width, this.height);
            var tablePath = new paper.Path.Rectangle(point, size);
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
            //tableFigure.strokeWidth = 5;
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