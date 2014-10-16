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
            path.strokeWidth = 4;
            path.strokeColor = '#888888';
            path.add(new paper.Point(this.x1, this.y1));
            path.add(new paper.Point(this.x2, this.y2));
            //path.strokeColor = scope.color;
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

            $.ajax({
                url: window.saveWallPath,
                type: 'POST',
                data: lineInfo,
                success: function (response) {
                    thisObject.roomObjectId = response.Id;
                }
            });
            //mapProvider.SaveWall(lineInfo, function (response) {
            //    thisObject.roomObjectId = response.Id;
            //});
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
            //mapProvider.DeleteRoomObject({ id: this.roomObjectId });
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
            this.identNumber = dbRoomObject.IdentNumber;
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
            $.ajax({
                url: window.saveTablePath,
                type: 'POST',
                data: rectangleInfo,
                success: function (response) {
                    thisObject.roomObjectId = response.Id;
                }
            });
            //mapProvider.SaveTable(rectangleInfo, function(response) {
            //    thisObject.roomObjectId = response.Id;
            //});
        }

        this.setCaption = function(tablePath) {
            var caption = '';
            if (this.employeeFio)
                caption = this.employeeFio;
            if (this.identNumber)
                caption = '[' + this.identNumber + '] ' + caption;
            if (caption) {
                setEmployeeTableText(tablePath, caption);
            }
        }

        function getPointText(x, y, str, fontSize, width) {
            var pointText = new PointText({
                point: [x, y],
                content: str,
                fillColor: '#000000',
                fontFamily: 'Courier New',
                fontSize: fontSize
            });
            if (width && pointText.bounds.width < width) {
                var offset = (width - pointText.bounds.width) / 2;
                pointText.point.x += offset;
            }
            return pointText;
        }

        this.getTableText = function(name, surname, identNumber, leftTopX, leftTopY, width, height) {
            var fontSize = 8;
            var result = [];
            result.push(getPointText(leftTopX, leftTopY, surname, fontSize, width));
            result.push(getPointText(leftTopX, leftTopY + fontSize + 2, name, fontSize, width));
            result.push(getPointText(leftTopX, leftTopY + height - fontSize, identNumber, fontSize, width));
            return result;
        }

        this.getPath = function () {
            var raster = new paper.Raster("maptable");
            raster.position = new paper.Point(this.leftTopX, this.leftTopY);
            raster.RoomObject = this;
            this.attachedPath = raster;
            //raster.rotate(90);

            raster.captions = this.getTableText('Михаил', 'Лермонтов', '2345', raster.position.x - 40, raster.position.y - 20, 80, 40);
            raster.addChild(raster.captions[0]);

            //raster.text = new PointText({
            //    point: [raster.position.x - 40, raster.position.y - 20],
            //    content: this.employeeFio,
            //    fillColor: scope.color,
            //    fontFamily: 'Courier New',
            //    fontSize: 10
            //});
            //if (this.identNumber) {
            //    raster.text2 = new PointText({
            //        point: [raster.position.x - 40, raster.position.y],
            //        content: this.identNumber,
            //        fillColor: scope.color,
            //        fontFamily: 'Courier New',
            //        fontSize: 10
            //    });
            //    raster.text2.rotate(90);
            //}
            return raster;
            //var tablePath = new paper.Path();
            //tablePath.add(new paper.Point(this.leftTopX, this.leftTopY));
            //tablePath.add(new paper.Point(this.leftTopX + this.width, this.leftTopY));
            //tablePath.add(new paper.Point(this.leftTopX + this.width, this.leftTopY + this.height));
            //tablePath.add(new paper.Point(this.leftTopX, this.leftTopY + this.height));
            //tablePath.closed = true;

            ////var point = new paper.Point(this.leftTopX, this.leftTopY);
            ////var size = new paper.Size(this.width, this.height);
            ////var tablePath = new paper.Path.Rectangle(point, size);
            //var smallWidth = this.width / 3;
            //var smallHeight = this.height / 2;
            ////tablePath.moveTo(this.leftTopX, this.leftTopY + (this.height - smallHeight) / 2);
            ////tablePath.lineTo(this.leftTopX - smallWidth, this.leftTopY + (this.height - smallHeight) / 2);

            ////tablePath.addChild(
            ////    new Path.Rectangle(
            ////        new paper.Point(
            ////            this.leftTopX - smallWidth,
            ////            this.leftTopY + (this.height - smallHeight) / 2),
            ////        new paper.Size(smallWidth, smallHeight)
            ////    ));
            //tablePath.strokeColor = scope.color;
            //this.setCaption(tablePath);
            //tablePath.RoomObject = this;
            //this.attachedPath = tablePath;
            //return tablePath;
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
            //mapProvider.DeleteRoomObject({ id: this.roomObjectId });
        }

        this.save = function() {
            var x1 = scope.view2ProjectX(this.attachedPath.segments[0].point.x);
            var y1 = scope.view2ProjectY(this.attachedPath.segments[0].point.y);
            var x2 = scope.view2ProjectX(this.attachedPath.segments[2].point.x);
            var y2 = scope.view2ProjectY(this.attachedPath.segments[2].point.y);
            this.leftTopX = Math.min(x1, x2);
            this.leftTopY = Math.min(y1, y2);
            this.width = Math.abs(x1 - x2);
            this.height = Math.abs(y1 - y2);
            var rectangleInfo = {
                RoomObjectId: this.roomObjectId,
                LeftTopX: this.leftTopX,
                LeftTopY: this.leftTopY,
                Width: this.width,
                Height: this.height
            };
            $.ajax({
                url: window.saveTablePath,
                type: 'POST',
                data: rectangleInfo
            });
            //mapProvider.SaveTable(rectangleInfo);
        }

        this.showDropDownMenu = function () {
            scope.tableDroppedDown = this.attachedPath;
            var canvas = $('#paperCanvas')[0];
            var x1 = this.attachedPath.segments[0].point.x;
            var y1 = this.attachedPath.segments[0].point.y;
            var x2 = this.attachedPath.segments[2].point.x;
            var y2 = this.attachedPath.segments[2].point.y;
            var dropDownMenu = $("#tableDropDownMenu");
            scope.showTableButtonsDropDownPanel();
            dropDownMenu.css({
                visibility: 'visible',
                left: Math.min(x1, x2) + canvas.offsetLeft,
                top: Math.min(y1, y2) + Math.abs(y1 - y2) + canvas.offsetTop,
            });
        }

        this.saveIdentNumber = function (identNumber) {
            $.ajax({
                url: window.saveIdentNumberPath,
                type: 'POST',
                data: { RoomObjectId: this.roomObjectId, IdentNumber: identNumber }
            });
            //mapProvider.SaveIdentNumber({ RoomObjectId: this.roomObjectId, IdentNumber: identNumber });
            this.identNumber = identNumber;
            this.setCaption(this.attachedPath);
            $("#tableDropDownMenu").css({ visibility: 'hidden' });
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
                fontSize: 10
            });
        }
    }
}