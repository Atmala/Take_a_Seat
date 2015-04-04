function TableRoomObject(scope, mapProvider) {
    var isSelected = false, isMoving = false, isMoved = false;
    var standardWidth = 70, standardHeight = 100;
    var leftTopX, leftTopY, width, height, textRectangle, realScale;
    var attachedPath, employeeFio, employeeId, identNumber, angle;
    var thisObject = this;

    function setTextRectangle () {
        switch (angle) {
            case 0:
                textRectangle = { x: 4, y: 12, width: 44, height: 90 };
                break;
            case 90:
                textRectangle = { x: 4, y: 12, width: 90, height: 44 };
                break;
            case 180:
                textRectangle = { x: 20, y: 12, width: 44, height: 90 };
                break;
            case 270:
                textRectangle = { x: 4, y: 30, width: 90, height: 44 };
                break;
        }
        textRectangle.x *= realScale;
        textRectangle.y *= realScale;
        textRectangle.width *= realScale;
        textRectangle.height *= realScale;
    }

    this.RoomObjectType = 'table';
    angle = 0;
    setTextRectangle();

    this.loadFromDb = function (dbRoomObject) {
        leftTopX = dbRoomObject.Rectangles[0].LeftTopX;
        leftTopY = dbRoomObject.Rectangles[0].LeftTopY;
        width = dbRoomObject.Rectangles[0].Width;
        height = dbRoomObject.Rectangles[0].Height;
        this.roomObjectId = dbRoomObject.Id;
        employeeFio = dbRoomObject.EmployeeFio;
        employeeId = dbRoomObject.EmployeeId;
        identNumber = dbRoomObject.IdentNumber;
        angle = dbRoomObject.Angle;
    }

    function isFoundItem () {
        return thisObject.roomObjectId === scope.foundRoomObjectId && !scope.editPlanMode;
    }

    function isSelectedItem () {
        return isSelected && !scope.editPlanMode;
    }

    this.createNew = function (x, y, newWidth, newHeight) {
        this.roomObjectId = 0;
        leftTopX = scope.toGrid(scope.view2ProjectX(x) - width / 2);
        leftTopY = scope.toGrid(scope.view2ProjectY(y) - height / 2);
        width = newWidth;
        height = newHeight;
        this.getPath();
    }

    this.createByClick = function (point) {
        this.createNew(point.x, point.y, standardWidth, standardHeight);
        this.getPath();
        isMoving = true;
        this.save();
    }
    
    function removeCaptions () {
        if (!attachedPath.captions) return;
        for (var i = 0; i < attachedPath.captions.length; i++) {
            attachedPath.captions[i].remove();
        }
        attachedPath.captions = undefined;
    }
    
    function setCaptions () {
        var style = {
            fitToCenter: true,
            fontSize: Math.min(11 * realScale, 14),
            fontweight: isFoundItem() ? 900 : 300,
            fontColor: isFoundItem() ? scope.foundColor : scope.fontColor
        };

        removeCaptions();
        var rect = {
            left: attachedPath.bounds.x + textRectangle.x,
            top: attachedPath.bounds.y + textRectangle.y,
            width: textRectangle.width,
            height: textRectangle.height
        }
        //attachedPath.captions = getMultiLineText(rect, style,
        //    this.roomObjectId + ' (' + leftTopX + ', ' + leftTopY + '');
        attachedPath.captions = getMultiLineText(rect, style, employeeFio);
        if (identNumber) {
            attachedPath.captions.push(getPointText(rect.left, rect.top + rect.height - style.fontSize,
                style, identNumber));
        }
        fitCaptionsToCenter(attachedPath.captions, rect.width);
    }

    this.getCurrentPosition = function () {
        return new paper.Point(scope.project2ViewX(leftTopX + width / 2),
            scope.project2ViewY(leftTopY + height / 2));
    }

    this.getPath = function () {
        if (attachedPath) {
            removeCaptions();
            attachedPath.remove();
        }
        var imagename = isFoundItem() ? "maptable_found" : (isSelectedItem() ? "maptable_active" : "maptable");
        var raster = new paper.Raster(imagename);
        raster.position = this.getCurrentPosition();
        raster.RoomObject = this;
        this.currentScale = scope.scale;
        realScale = (isSelectedItem() || isFoundItem()) && this.currentScale < 1 ? 1 : this.currentScale;
        raster.scale(realScale);
        attachedPath = raster;
        raster.rotate(angle);
        setTextRectangle();
        setCaptions();
        return raster;
    }
    
    this.updatePosition = function () {
        if (scope.scale !== this.currentScale) {
            this.getPath();
        } else {
            attachedPath.position = this.getCurrentPosition();
            setTextRectangle();
            setCaptions();
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
            LeftTopX: leftTopX,
            LeftTopY: leftTopY,
            Width: width,
            Height: height
        };

        $.ajax({
            url: window.saveTablePath,
            async: false,
            type: 'POST',
            data: rectangleInfo,
            success: function (response) {
                console.log("Table is saved. RoomObjectId = " + response.RoomObjectId);
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
        scope.tableDroppedDown = attachedPath;
        scope.setTableDropDownMenuMode('buttons');
        scope.tableDropDownMenuVisible = true;
        scope.$apply();

        var dropDownMenu = $("#tableDropDownMenu");
        dropDownMenu.css({
            left: scope.project2ViewX(this.left() - 56),
            top: scope.project2ViewY(this.bottom())
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
        identNumber = identNumber;
        setCaptions();
        scope.tableDropDownMenuVisible = false;
    }

    this.rotate = function () {
        attachedPath.rotate(90);
        angle += 90;
        if (angle == 360) angle = 0;
        setTextRectangle();
        setCaptions();
    }

    this.saveAngle = function () {
        $.ajax({
            url: window.saveAnglePath,
            type: 'POST',
            data: { RoomObjectId: this.roomObjectId, Angle: angle }
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
        employeeId = employee.Id;
        employeeFio = employee.FioShort;
        setCaptions();
        saveEmployeeTableLink(employee.Id, this.roomObjectId);
    }

    this.discardEmployee = function () {
        removeEmployeeTableLink(employeeId, this.roomObjectId);
        employeeId = undefined;
        employeeFio = undefined;
        setCaptions();
    }

    this.left = function () {
        return leftTopX;
    }

    this.top = function () {
        return leftTopY;
    }

    this.right = function () {
        if (angle === 90 || angle === 270)
            return leftTopX + height;
        else
            return leftTopX + width;
    }

    this.bottom = function () {
        if (angle === 90 || angle === 270)
            return leftTopY + width;
        else
            return leftTopY + height;
    }

    this.move = function (offsetX, offsetY) {
        if (!isMoving) return;
        isMoved = true;
        leftTopX = scope.toGrid(scope.view2ProjectXNoGrid(attachedPath.position.x + offsetX) - width / 2);
        leftTopY = scope.toGrid(scope.view2ProjectYNoGrid(attachedPath.position.y + offsetY) - height / 2);

        var newX = scope.project2ViewX(leftTopX + width / 2);
        var realOffsetX = newX - attachedPath.position.x;
        attachedPath.position.x = newX;
        var newY = scope.project2ViewY(leftTopY + height / 2);
        var realOffsetY = newY - attachedPath.position.y;
        attachedPath.position.y = newY;
        if (attachedPath.captions) {
            for (var i = 0; i < attachedPath.captions.length; i++) {
                attachedPath.captions[i].point.x += realOffsetX;
                attachedPath.captions[i].point.y += realOffsetY;
            }
        }
    }

    this.select = function () {
        this.getPath();
    }

    this.unselect = function () {
        isSelected = false;
        scope.tableDropDownMenuVisible = false;
        this.getPath();
    }

    this.selectByPoint = function (point, tolerance) {
        var projectPoint = scope.view2Project(point);
        isSelected = projectPoint.x >= this.left() && projectPoint.x <= this.right()
            && projectPoint.y >= this.top() && projectPoint.y <= this.bottom();
        if (isSelected) this.select();
        return isSelected;
    }
    
    this.onMouseUp = function () {
        if (isMoved) {
            this.save();
            isMoving = false;
            isMoved = false;
        } else {
            this.showDropDownMenu();
        }
    }

    this.onMouseDown = function () {
        isMoving = true;
    }

    this.isMoving = function () {
        return isMoving;
    }

    this.dbCoordinatesString = function () {
        return 'Table: (' + leftTopX + ',' + leftTopY + ')';
    }

}