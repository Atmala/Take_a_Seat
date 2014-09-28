function RoomObjectFactory(scope, mapProvider) {
    this.getPathByDbRoomObject = function (dbRoomObject) {

        var roomObject = null;
        if (dbRoomObject.Points && dbRoomObject.Points.length > 0) {
            roomObject = new wallRoomObject(dbRoomObject);
        }
        if (dbRoomObject.Rectangles && dbRoomObject.Rectangles.length > 0) {
            roomObject = new tableRoomObject(dbRoomObject);
        }
        if (roomObject) {
            var path = roomObject.getPath();
            path.RoomObject = roomObject;
            roomObject.attachedPath = path;
            return path;
        }
        return null;
    }

    function wallRoomObject(dbRoomObject) {
        this.getPath = function () {
            var path = new paper.Path();
            path.RoomObjectType = 'wall';
            path.moveTo(new paper.Point([dbRoomObject.Points[0].X, dbRoomObject.Points[0].Y]));
            path.lineTo(new paper.Point([dbRoomObject.Points[1].X, dbRoomObject.Points[1].Y]));
            return path;
        }
    }

    function tableRoomObject() {
        this.RoomObjectType = 'table';

        this.loadFromDb = function (dbRoomObject) {
            this.dbRoomObjectId = dbRoomObject.Id;
            this.leftTopX = dbRoomObject.Rectangles[0].LeftTopX;
            this.leftTopY = dbRoomObject.Rectangles[0].LeftTopY;
            this.width = dbRoomObject.Rectangles[0].Width;
            this.height = dbRoomObject.Rectangles[0].Height;
            this.roomObjectId = dbRoomObject.Id;
            this.employeeFio = dbRoomObject.employeeFio;
            this.EmployeeId = dbRoomObject.EmployeeId;
        }

        this.getPath = function () {
            var point = new paper.Point(this.leftTopX, this.leftTopY);
            var size = new paper.Size(this.width, this.height);
            var tablePath = new paper.Path.Rectangle(point, size);
            //tablePath.strokeColor = color;
            if (this.employeeFio != '') {
                tablePath.dbEmployeeId = dbRoomObject.EmployeeId;
                setEmployeeTableText(tablePath, dbRoomObject.EmployeeFio);
            }
            return tablePath;
        }

        this.deleteRoomObject = function () {
            if (this.attachedPath.text) {
                this.attachedPath.text.remove();
                scope.loadEmployees();
            }
            mapProvider.DeleteRoomObject({ id: this.dbRoomObjectId });
        }

        function setEmployeeTableText(tableFigure, employeeFio) {
            //tableFigure.strokeWidth = 5;
            if (tableFigure.text) {
                tableFigure.text.remove();
            }

            tableFigure.text = new PointText({
                point: [tableFigure.position.x - 18, tableFigure.position.y - 35],
                content: employeeFio,
                //fillColor: color,
                fontFamily: 'Courier New',
                fontWeight: 'bold',
                fontSize: 15
            });
        }
    }
}