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
        this.setTextRectangle = function () {
            switch (this.degree) {
                case 0:
                    this.textRectangle = { x: 4, y: 10, width: 40, height: 90 };
                    break;
                case 90:
                    this.textRectangle = { x: 4, y: 10, width: 90, height: 40 };
                    break;
                case 180:
                    this.textRectangle = { x: 20, y: 10, width: 40, height: 90 };
                    break;
                case 270:
                    this.textRectangle = { x: 4, y: 30, width: 90, height: 40 };
                    break;
            }
        }

        this.RoomObjectType = 'table';
        this.degree = 0;
        this.setTextRectangle();

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

        this.removeCaptions = function() {
            if (! this.attachedPath.captions) return;
            for (var i = 0; i < this.attachedPath.captions.length; i++) {
                this.attachedPath.captions[i].remove();
            }
            this.attachedPath.captions = undefined;
        }

        this.setCaptions = function () {
            this.removeCaptions();
            this.attachedPath.captions = this.getTableText('Михаил', 'Лермонтов', '2345',
                this.attachedPath.bounds.x + this.textRectangle.x, this.attachedPath.bounds.y + this.textRectangle.y,
                this.textRectangle.width, this.textRectangle.height);
        }

        this.getPath = function () {
            var raster = new paper.Raster("maptable");
            raster.position = new paper.Point(this.leftTopX + this.width / 2, this.leftTopY + this.height / 2);
            raster.RoomObject = this;
            this.attachedPath = raster;
            this.setCaptions();
            return raster;
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
            var rectangleInfo = {
                RoomObjectId: this.roomObjectId,
                LeftTopX: this.attachedPath.position.x - this.width / 2,
                LeftTopY: this.attachedPath.position.y - this.height / 2,
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
            var dropDownMenu = $("#tableDropDownMenu");
            scope.showTableButtonsDropDownPanel();
            dropDownMenu.css({
                visibility: 'visible',
                left: this.attachedPath.bounds.left + canvas.offsetLeft - 56,
                top: this.attachedPath.bounds.bottom + canvas.offsetTop,
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

        this.rotate = function() {
            this.attachedPath.rotate(90);
            this.degree += 90;
            if (this.degree == 360) this.degree = 0;
            this.setTextRectangle();
            this.setCaptions();
        }

        
    }
}