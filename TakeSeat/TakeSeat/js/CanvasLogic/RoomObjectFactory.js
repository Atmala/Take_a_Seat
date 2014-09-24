﻿function RoomObjectFactory(scope, mapProvider) {
    this.getPathByDbRoomObject = function (dbRoomObject) {

        if (dbRoomObject.Points && dbRoomObject.Points.length > 0) {
            return getWallPath(dbRoomObject);
        }
        if (dbRoomObject.Rectangles && dbRoomObject.Rectangles.length > 0) {
            return getTablePath(dbRoomObject);
        }
        return null;
    }

    function getWallPath(dbRoomObject) {
        var path = new paper.Path();
        path.RoomObjectType = 'wall';
        path.moveTo(new paper.Point([dbRoomObject.Points[0].X, dbRoomObject.Points[0].Y]));
        path.lineTo(new paper.Point([dbRoomObject.Points[1].X, dbRoomObject.Points[1].Y]));
        return path;
    }

    function getTablePath(dbRoomObject) {
        var point = new paper.Point(dbRoomObject.Rectangles[0].LeftTopX, dbRoomObject.Rectangles[0].LeftTopY);
        var size = new paper.Size(dbRoomObject.Rectangles[0].Width, dbRoomObject.Rectangles[0].Height);
        var tablePath = new paper.Path.Rectangle(point, size);
        tablePath.dbRoomObjectId = dbRoomObject.Id;
        tablePath.RoomObjectType = 'table';
        //tablePath.strokeColor = color;
        if (dbRoomObject.EmployeeFio != '') {
            tablePath.dbEmployeeId = dbRoomObject.EmployeeId;
            setEmployeeTableText(tablePath, dbRoomObject.EmployeeFio);
        }
        return tablePath;
    }

    function setEmployeeTableText(tableFigure, employeeFio) {
        //tableFigure.strokeWidth = 5;
        if (tableFigure.text) {
            tableFigure.text.remove();
        }

        tableFigure.text = new PointText({
            point: [tableFigure.position.x - 18, tableFigure.position.y - 35],
            content: employeeFio,
            fillColor: color,
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 15
        });
    }
}