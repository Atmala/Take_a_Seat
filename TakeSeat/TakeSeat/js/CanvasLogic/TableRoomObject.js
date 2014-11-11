function TableRoomObject(scope, mapProvider) {
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
        this.textRectangle.x *= scope.scale;
        this.textRectangle.y *= scope.scale;
        this.textRectangle.width *= scope.scale;
        this.textRectangle.height *= scope.scale;
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
        this.isFoundItem = this.roomObjectId === scope.foundRoomObjectId;
    }

    this.createNew = function (x, y, width, height) {
        this.leftTopX = scope.view2ProjectX(x) - width / 2;
        this.leftTopY = scope.view2ProjectY(y) - height / 2;
        this.width = width;
        this.height = height;
        var thisObject = this;

        var rectangleInfo = {
            RoomObjectId: 0,
            LeftTopX: this.leftTopX,
            LeftTopY: this.leftTopY,
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
            fillColor: style.fontColor,
            fontFamily: 'Courier New',
            fontWeight: 'bold',
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
        if (!str) return result;
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

    this.removeCaptions = function () {
        if (!this.attachedPath.captions) return;
        for (var i = 0; i < this.attachedPath.captions.length; i++) {
            this.attachedPath.captions[i].remove();
        }
        this.attachedPath.captions = undefined;
    }

    this.setCaptions = function () {
        var style = {
            fitToCenter: true,
            fontSize: Math.min(11 * scope.scale, 14),
            fontColor: this.isFoundItem ? scope.foundColor : scope.fontColor
        };

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
        raster.position = new paper.Point(scope.project2ViewX(this.leftTopX + this.width / 2),
            scope.project2ViewY(this.leftTopY + this.height / 2));
        raster.RoomObject = this;
        raster.scale(scope.scale);
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
            data: { id: this.roomObjectId },
            success: function (response) {
                scope.loadEmployees();
            }, error: function (req, status, error) {
                alert("Error: " + error);
            }
        });
    }

    this.save = function () {
        var rectangleInfo = {
            RoomObjectId: this.roomObjectId,
            LeftTopX: scope.view2ProjectX(this.attachedPath.position.x) - this.width / 2,
            LeftTopY: scope.view2ProjectY(this.attachedPath.position.y) - this.height / 2,
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
        scope.setTableDropDownMenuMode('buttons');
        scope.tableDropDownMenuVisible = 'true';
        scope.$apply();
        
        var dropDownMenu = $("#tableDropDownMenu");
        dropDownMenu.css({
            left: this.attachedPath.bounds.left + canvas.offsetLeft - 56,
            top: this.attachedPath.bounds.bottom + canvas.offsetTop,
        });
    }

    this.saveIdentNumber = function (identNumber) {
        $.ajax({
            url: window.saveIdentNumberPath,
            type: 'POST',
            data: { RoomObjectId: this.roomObjectId, IdentNumber: identNumber },
            success: function (response) {
                scope.loadEmployees();
            }
        });
        this.identNumber = identNumber;
        this.setCaptions();
        scope.tableDropDownMenuVisible = 'false';
    }

    this.rotate = function () {
        this.attachedPath.rotate(90);
        this.angle += 90;
        if (this.angle == 360) this.angle = 0;
        this.setTextRectangle();
        this.setCaptions();
    }

    this.saveAngle = function () {
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
            data: employeeTableLink,
            success: function (response) {
                scope.loadEmployees();
            }
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
            data: employeeTableLink,
            success: function (response) {
                scope.loadEmployees();
            }
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