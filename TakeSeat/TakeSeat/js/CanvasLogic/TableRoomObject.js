function TableRoomObject(scope, mapProvider) {
    var isSelected = false;

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
        this.textRectangle.x *= this.realScale;
        this.textRectangle.y *= this.realScale;
        this.textRectangle.width *= this.realScale;
        this.textRectangle.height *= this.realScale;
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

    this.isFoundItem = function() {
        return this.roomObjectId === scope.foundRoomObjectId && !scope.editPlanMode;
    }

    this.isSelectedItem = function() {
        return isSelected && !scope.editPlanMode;
    }

    this.createNew = function (x, y, width, height) {
        this.roomObjectId = 0;
        this.leftTopX = scope.toGrid(scope.view2ProjectX(x) - width / 2);
        this.leftTopY = scope.toGrid(scope.view2ProjectY(y) - height / 2);
        this.width = width;
        this.height = height;

        this.save();
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
            fontSize: Math.min(11 * this.realScale, 14),
            fontweight: this.isFoundItem() ? 900 : 300,
            fontColor: this.isFoundItem() ? scope.foundColor : scope.fontColor
        };

        this.removeCaptions();
        var rect = {
            left: this.attachedPath.bounds.x + this.textRectangle.x,
            top: this.attachedPath.bounds.y + this.textRectangle.y,
            width: this.textRectangle.width,
            height: this.textRectangle.height
        }
        //this.attachedPath.captions = getMultiLineText(rect, style,
        //    this.roomObjectId + ' (' + this.leftTopX + ', ' + this.leftTopY + '');
        this.attachedPath.captions = getMultiLineText(rect, style, this.employeeFio);
        if (this.identNumber) {
            this.attachedPath.captions.push(getPointText(rect.left, rect.top + rect.height - style.fontSize,
                style, this.identNumber));
        }
        fitCaptionsToCenter(this.attachedPath.captions, rect.width);
    }

    this.getCurrentPosition = function () {
        return new paper.Point(scope.project2ViewX(this.leftTopX + this.width / 2),
            scope.project2ViewY(this.leftTopY + this.height / 2));
    }

    this.getPath = function () {
        if (this.attachedPath) {
            this.removeCaptions();
            this.attachedPath.remove();
        }
        var imagename = this.isFoundItem() ? "maptable_found" : (this.isSelectedItem() ? "maptable_active" : "maptable");
        var raster = new paper.Raster(imagename);
        raster.position = this.getCurrentPosition();
        raster.RoomObject = this;
        this.currentScale = scope.scale;
        this.realScale = (this.isSelectedItem() || this.isFoundItem()) && this.currentScale < 1 ? 1 : this.currentScale;
        raster.scale(this.realScale);
        this.attachedPath = raster;
        raster.rotate(this.angle);
        this.setTextRectangle();
        this.setCaptions();
        return raster;
    }

    this.updatePosition = function () {
        if (scope.scale !== this.currentScale) {
            this.getPath();
        } else {
            this.attachedPath.position = this.getCurrentPosition();
            this.setTextRectangle();
            this.setCaptions();
        }
    }

    this.deleteRoomObject = function () {
        var thisObject = this;
        $.ajax({
            url: window.deleteRoomObjectPath,
            type: 'POST',
            data: { id: this.roomObjectId },
            success: function (response) {
                thisObject.removeCaptions();
                thisObject.attachedPath.remove();
                scope.loadEmployees();
            }
        });
    }
    
    this.save = function () {
        var thisObject = this;
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
            data: rectangleInfo,
            success: function (response) {
                if (response.RoomObjectId == 0) {
                    thisObject.attachedPath.remove();
                } else {
                    thisObject.roomObjectId = response.RoomObjectId;
                    thisObject.leftTopX = response.LeftTopX;
                    thisObject.leftTopY = response.LeftTopY;
                    thisObject.attachedPath.position = thisObject.getCurrentPosition();
                }
            }
        });
    }

    this.showDropDownMenu = function () {
        scope.tableDroppedDown = this.attachedPath;
        var canvas = $('#paperCanvas')[0];
        scope.setTableDropDownMenuMode('buttons');
        scope.tableDropDownMenuVisible = true;
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
        scope.tableDropDownMenuVisible = false;
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

    this.left = function () {
        return this.leftTopX;
    }

    this.top = function () {
        return this.leftTopY;
    }

    this.right = function () {
        if (this.angle === 90 || this.angle === 270)
            return this.leftTopX + this.height;
        else
            return this.leftTopX + this.width;
    }

    this.bottom = function () {
        if (this.angle === 90 || this.angle === 270)
            return this.leftTopY + this.width;
        else
            return this.leftTopY + this.height;
    }

    this.move = function (offsetX, offsetY) {
        this.leftTopX = scope.toGrid(scope.view2ProjectXNoGrid(this.attachedPath.position.x + offsetX) - this.width / 2);
        this.leftTopY = scope.toGrid(scope.view2ProjectYNoGrid(this.attachedPath.position.y + offsetY) - this.height / 2);

        var newX = scope.project2ViewX(this.leftTopX + this.width / 2);
        var realOffsetX = newX - this.attachedPath.position.x;
        this.attachedPath.position.x = newX;
        var newY = scope.project2ViewY(this.leftTopY + this.height / 2);
        var realOffsetY = newY - this.attachedPath.position.y;
        this.attachedPath.position.y = newY;
        if (this.attachedPath.captions) {
            for (var i = 0; i < this.attachedPath.captions.length; i++) {
                this.attachedPath.captions[i].point.x = this.attachedPath.captions[i].point.x + realOffsetX;
                this.attachedPath.captions[i].point.y = this.attachedPath.captions[i].point.y + realOffsetY;
            }
        }
    }

    this.select = function () {
        this.getPath();
    }

    this.unselect = function () {
        isSelected = false;
        this.getPath();
    }

    this.selectByPoint = function (point, tolerance) {
        var projectPoint = scope.view2Project(point);
        isSelected = projectPoint.x >= this.left() && projectPoint.x <= this.right()
            && projectPoint.y >= this.top() && projectPoint.y <= this.bottom();
        if (isSelected) this.select();
        return isSelected;
    }
}