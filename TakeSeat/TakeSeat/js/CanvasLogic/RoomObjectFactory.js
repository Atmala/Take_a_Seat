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
            path.strokeColor = scope.wallColor;
            path.add(new paper.Point(this.x1, this.y1));
            path.add(new paper.Point(this.x2, this.y2));
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

    function tableRoomObject() {
        this.setTextRectangle = function () {
            switch (this.angle) {
                case 0:
                    this.textRectangle = { x: 4, y: 12, width: 44, height: 90 };
                    break;
                case 90:
                    this.textRectangle = { x: 4, y: 12, width: 90, height: 44 };
                    break;
                case 180:
                    this.textRectangle = { x: 20, y: 12, width: 44, height: 90 };
                    break;
                case 270:
                    this.textRectangle = { x: 4, y: 30, width: 90, height: 44 };
                    break;
            }
        }

        this.RoomObjectType = 'table';
        this.angle = 0;
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
            this.angle = dbRoomObject.Angle;
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
        }

        function getPointText(rect, style, str) {
            return new PointText({
                point: [rect.left, rect.top],
                content: str,
                fillColor: '#000000',
                fontFamily: 'Courier New',
                fontSize: style.fontSize
            });
        }

        function fitToWidth(pointText, width) {
            if (pointText.bounds.width <= width) return;
            var index = pointText.content.indexOf(' ');
            if (index == -1) index = pointText.content.length - 1;
            while (pointText.bounds.width > width && pointText.content.length > 0) {
                pointText.content = pointText.content.substring(0, index);
                index--;
            }
        }

        function fitCaptionsToCenter(captions, width) {
            for (var i = 0; i < captions.length; i++) {
                var pointText = captions[i];
                var offset = (width - pointText.bounds.width) / 2;
                pointText.point.x += offset;
            }
        }

        function getMultiLineText(rect, style, str) {
            var result = [];
            if (! str) return result;
            var pointText = getPointText(rect, style, str);
            result.push(pointText);

            if (pointText.bounds.width > rect.width) {
                fitToWidth(pointText, rect.width);
                
                var newStr = str.substring(pointText.content.length, str.length).trim();
                var restCaptions = getMultiLineText(
                    { left: rect.left, top: rect.top + style.fontSize + 2, width: rect.width, height: rect.height },
                    style, newStr);
                for (var i = 0; i < restCaptions.length; i++) {
                    result.push(restCaptions[i]);
                }
            }
            
            return result;
        }

        this.getTableText = function(rect, employeeFio, identNumber, leftTopX, leftTopY, width, height) {
            var style = { fitToCenter: true, fontSize: 11 };
            var result = getMultiLineText(
                { left: leftTopX, top: leftTopY, width: width, height: height },
                style, surname + ' ' + name);
            result.push(getPointText(
                { left: leftTopX, top: leftTopY + height - style.fontSize, width: width, height: height },
                style, identNumber));
            fitCaptionsToCenter(result, width);
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
            var style = { fitToCenter: true, fontSize: 11 };
            this.removeCaptions();
            var rect = {
                left: this.attachedPath.bounds.x + this.textRectangle.x,
                top: this.attachedPath.bounds.y + this.textRectangle.y,
                width: this.textRectangle.width,
                height: this.textRectangle.height
            }
            this.attachedPath.captions = getMultiLineText(rect, style, this.employeeFio);
            if (this.identNumber) {
                this.attachedPath.captions.push(getPointText(
                    { left: rect.left, top: rect.top + rect.height - style.fontSize, width: rect.width, height: rect.height },
                    style, this.identNumber));
            }
            fitCaptionsToCenter(this.attachedPath.captions, rect.width);
        }

        this.getPath = function () {
            var raster = new paper.Raster("maptable");
            raster.position = new paper.Point(this.leftTopX + this.width / 2, this.leftTopY + this.height / 2);
            raster.RoomObject = this;
            this.attachedPath = raster;
            raster.rotate(this.angle);
            this.setTextRectangle();
            this.setCaptions();
            return raster;
        }

        this.deleteRoomObject = function () {
            this.removeCaptions();
            $.ajax({
                url: window.deleteRoomObjectPath,
                type: 'POST',
                data: { id: this.roomObjectId }
            });
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
            this.identNumber = identNumber;
            this.setCaptions();
            $("#tableDropDownMenu").css({ visibility: 'hidden' });
        }

        this.rotate = function() {
            this.attachedPath.rotate(90);
            this.angle += 90;
            if (this.angle == 360) this.angle = 0;
            this.setTextRectangle();
            this.setCaptions();
        }

        this.saveAngle = function() {
            $.ajax({
                url: window.saveAnglePath,
                type: 'POST',
                data: { RoomObjectId: this.roomObjectId, Angle: this.angle }
            });
        }

        function saveEmployeeTableLink(employeeId, roomObjectId) {
            var employeeTableLink = {
                EmployeeId: employeeId,
                RoomObjectId: roomObjectId
            };
            $.ajax({
                url: window.saveEmployeeTableLinkPath,
                type: 'POST',
                data: employeeTableLink
            });
        }

        function removeEmployeeTableLink(employeeId, roomObjectId) {
            var employeeTableLink = {
                EmployeeId: employeeId,
                RoomObjectId: roomObjectId
            };
            $.ajax({
                url: window.removeEmployeeTableLinkPath,
                type: 'POST',
                data: employeeTableLink
            });
        }

        this.assignEmployee = function (employee) {
            this.employeeId = employee.Id;
            this.employeeFio = employee.FioShort;
            this.setCaptions();
            saveEmployeeTableLink(employee.Id, this.roomObjectId);
        }

        this.discardEmployee = function () {
            removeEmployeeTableLink(this.employeeId, this.roomObjectId);
            this.employeeId = undefined;
            this.employeeFio = undefined;
            this.setCaptions();
        }
    }
}