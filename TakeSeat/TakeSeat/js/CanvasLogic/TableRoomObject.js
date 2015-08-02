function TableRoomObject(scope, mapProvider) {
    this.RoomObjectType = 'table';
    var isSelected = false, isMoving = false, isMoved = false;
    var standardWidth = 70, standardHeight = 100;
    var roomObjectId, leftTopX, leftTopY, width, height, textRectangle, realScale, currentScale;
    var attachedPath, employeeFio, employeeUrl, employeeId, identNumber, angle = 0;
    var thisObject = this;

    this.getRoomObjectId = function () {
        return roomObjectId;
    }

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
    
    setTextRectangle();

    this.loadFromDb = function (dbRoomObject) {
        leftTopX = dbRoomObject.Rectangles[0].LeftTopX;
        leftTopY = dbRoomObject.Rectangles[0].LeftTopY;
        width = dbRoomObject.Rectangles[0].Width;
        height = dbRoomObject.Rectangles[0].Height;
        roomObjectId = dbRoomObject.Id;
        employeeFio = dbRoomObject.EmployeeFio;
        employeeUrl = dbRoomObject.EmployeeUrl;
        employeeId = dbRoomObject.EmployeeId;
        identNumber = dbRoomObject.IdentNumber;
        angle = dbRoomObject.Angle;
    }

    function isFoundItem () {
        return roomObjectId === scope.foundRoomObjectId && !scope.editPlanMode;
    }

    function isSelectedItem () {
        return isSelected && !scope.editPlanMode;
    }

    this.createNew = function (x, y, newWidth, newHeight) {
        roomObjectId = 0;
        leftTopX = roundTo10(scope.view2ProjectX(x)) - newWidth / 2;
        leftTopY = roundTo10(scope.view2ProjectY(y)) - newHeight / 2;
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
        currentScale = scope.scale;
        realScale = (isSelectedItem() || isFoundItem()) && currentScale < 1 ? 1 : currentScale;
        raster.scale(realScale);
        attachedPath = raster;
        raster.rotate(angle);
        setTextRectangle();
        setCaptions();
        document.body.style.cursor = isSelectedItem() && employeeUrl ? "pointer" : "default";
        return raster;
    }
    
    this.updatePosition = function () {
        if (scope.scale !== currentScale) {
            this.getPath();
        } else {
            attachedPath.position = this.getCurrentPosition();
            setTextRectangle();
            setCaptions();
        }
    }

    this.deleteRoomObject = function () {
        $.ajax({
            url: window.deleteRoomObjectPath,
            async: false,
            type: 'POST',
            data: { id: roomObjectId },
            success: function (response) {
                removeCaptions();
                attachedPath.remove();
                scope.loadEmployees();
            }
        });
    }
    
    this.save = function () {
        var rectangleInfo = {
            RoomObjectId: roomObjectId,
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
                if (response.RoomObjectId == 0) {
                    attachedPath.remove();
                } else {
                    roomObjectId = response.RoomObjectId;
                    leftTopX = response.LeftTopX;
                    leftTopY = response.LeftTopY;
                    attachedPath.position = thisObject.getCurrentPosition();
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
        var currentBounds = this.bounds();
        dropDownMenu.css({
            left: scope.project2ViewX(currentBounds.left - 56),
            top: scope.project2ViewY(currentBounds.bottom)
        });
    }

    this.saveIdentNumber = function (identNumber) {
        $.ajax({
            url: window.saveIdentNumberPath,
            type: 'POST',
            data: { RoomObjectId: roomObjectId, IdentNumber: identNumber },
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
            data: { RoomObjectId: roomObjectId, Angle: angle }
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
        saveEmployeeTableLink(employee.Id, roomObjectId);
    }

    this.discardEmployee = function () {
        removeEmployeeTableLink(employeeId, roomObjectId);
        employeeId = undefined;
        employeeFio = undefined;
        setCaptions();
    }

    this.bounds = function() {
        return {
            left: leftTopX,
            right: isHorizontalOriented ? leftTopX + width : leftTopX + height,
            top: leftTopY,
            bottom: isHorizontalOriented ? leftTopY + height : leftTopX + width
        };
    }

    function isHorizontalOriented () {
        return angle === 90 || angle === 270;
    }
                
    this.move = function (viewOffsetX, viewOffsetY) {
        if (!isMoving) return;
        isMoved = true;
        var offsetX = roundTo10(viewOffsetX / scope.scale);
        var offsetY = roundTo10(viewOffsetY / scope.scale);
        leftTopX += offsetX;
        leftTopY += offsetY; 
        //leftTopX = scope.toGrid(scope.view2ProjectXNoGrid(attachedPath.position.x + offsetX) - width / 2);
        //leftTopY = scope.toGrid(scope.view2ProjectYNoGrid(attachedPath.position.y + offsetY) - height / 2);

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
        var currentBounds = this.bounds();
        isSelected = projectPoint.x >= currentBounds.left && projectPoint.x <= currentBounds.right
            && projectPoint.y >= currentBounds.top && projectPoint.y <= currentBounds.bottom;
        if (isSelected) this.select();
        return isSelected;
    }
    
    this.onMouseUp = function () {
        if (scope.editPlanMode) {
            if (isMoved) {
                this.save();
                isMoving = false;
                isMoved = false;
            } else {
                this.showDropDownMenu();
            }
        } else {
            if (employeeUrl) {
                //window.location.href = employeeUrl;
                window.open(employeeUrl, '_blank');
            }
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

    function roundTo10(x) {
        return Math.round(x / 10) * 10;
    }
}