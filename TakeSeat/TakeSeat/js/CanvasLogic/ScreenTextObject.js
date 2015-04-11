function ScreenTextObject(scope, mapProvider) {
    var isSelected = false, isMoving = false, isMoved = false;
    this.RoomObjectType = 'screentext';

    this.getRoomObjectId = function () {
        return roomObjectId;
    }

    this.createNew = function (x, y, text) {
        this.leftTopX = scope.view2ProjectX(x);
        this.leftTopY = scope.view2ProjectY(y);
        this.text = text;
    }

    this.createByClick = function (point) {
        this.createInProgress = true;
        this.createNew(point.x, point.y, '');
        showScreenTextDropDownMenu(point.x - 50, point.y - 20, '');
    }
    
    function showScreenTextDropDownMenu (x, y, text) {
        var canvas = $('#paperCanvas')[0];
        scope.screenTextDropDownMenuVisible = true;
        scope.$apply();

        var dropDownMenu = $("#screenTextDropDownMenu");
        dropDownMenu.css({
            left: x + canvas.offsetLeft,
            top: y + canvas.offsetTop,
        });
        scope.screenTextDropDownText = text;
        $("#screenTextDropDownNumberInput").focus();
    }

    this.isSelectedItem = function () {
        return isSelected && !scope.editPlanMode;
    }

    this.getPath = function () {
        if (this.attachedPath) this.attachedPath.remove();
        this.currentScale = scope.scale;
        this.realScale = this.isSelectedItem() && this.currentScale < 1 ? 1 : this.currentScale;
        var style = {
            fitToCenter: true,
            fontSize: 16 * this.realScale,
            fontweight: 300,
            fontColor: isSelected ? '#0000CD' : scope.fontColor
        };
        this.attachedPath = getPointText(scope.project2ViewX(this.leftTopX), scope.project2ViewY(this.leftTopY), style, this.text);
        var width = this.attachedPath.bounds.width;
        var offsetX = width * (this.realScale - this.currentScale) / 2;
        this.attachedPath.point.x -= offsetX;
        this.attachedPath.RoomObject = this;
        this.width = Math.round(this.attachedPath.bounds.width);
        return this.attachedPath;
    }

    this.loadFromDb = function (dbRoomObject) {
        this.leftTopX = dbRoomObject.ScreenTexts[0].LeftTopX;
        this.leftTopY = dbRoomObject.ScreenTexts[0].LeftTopY;
        this.width = dbRoomObject.ScreenTexts[0].Width;
        this.text = dbRoomObject.ScreenTexts[0].Text;
        this.roomObjectId = dbRoomObject.Id;
        this.getPath();
    }

    this.save = function () {
        var thisObject = this;
        var screenTextInfo = {
            RoomId: scope.room.Id,
            RoomObjectId: this.roomObjectId,
            LeftTopX: this.leftTopX,
            LeftTopY: this.leftTopY,
            Width: this.width,
            Text: this.text
        };

        $.ajax({
            url: window.saveScreenTextPath,
            type: 'POST',
            data: screenTextInfo,
            success: function (response) {
                if (response.RoomObjectId == 0) {
                    thisObject.attachedPath.remove();
                } else {
                    thisObject.roomObjectId = response.RoomObjectId;
                    thisObject.leftTopX = response.LeftTopX;
                    thisObject.leftTopY = response.LeftTopY;
                    thisObject.width = response.Width;
                    thisObject.text = response.Text;
                    thisObject.getPath();
                }
            }
        });
    }

    this.updatePosition = function () {
        if (scope.scale !== this.currentScale) {
            this.getPath();
        } else {
            this.attachedPath.point.x = scope.project2ViewX(this.leftTopX);
            this.attachedPath.point.y = scope.project2ViewY(this.leftTopY);
        }
    }

    this.bounds = function() {
        return {
            left: this.leftTopX,
            right: this.leftTopX + this.attachedPath.bounds.width,
            top: this.leftTopY,
            bottom: this.leftTopY + this.attachedPath.bounds.height
        };
    }
    
    this.findScreenText = function(point, tolerance) {
        var x = scope.view2ProjectX(point.x);
        var y = scope.view2ProjectY(point.y);
        var left = this.left();
        var right = this.right();
        var top = this.top();
        var bottom = this.bottom();
        scope.LogMessage1 = '(' + x + ',' + y + '): ' + '[' + left + ',' + top + '] - [' + right + ',' + bottom + ']';
        if (x >= this.left() && x <= this.right() && y >= this.top() && y <= this.bottom()) {
            return {type: 'screentext', item: this.attachedPath};
        }
        return undefined;
    }

    this.dbCoordinatesString = function() {
        return 'ScreenText ' + this.roomObjectId;
    }

    this.move = function (offsetX, offsetY) {
        if (!isMoving) return;
        isMoved = true;
        var viewX = scope.project2ViewX(this.leftTopX) + offsetX;
        var viewY = scope.project2ViewY(this.leftTopY) + offsetY;
        this.leftTopX = scope.view2ProjectX(viewX);
        this.leftTopY = scope.view2ProjectY(viewY);
        this.attachedPath.point.x = scope.project2ViewX(this.leftTopX);
        this.attachedPath.point.y = scope.project2ViewY(this.leftTopY);
    }

    this.deleteRoomObject = function () {
        $.ajax({
            url: window.deleteRoomObjectPath,
            type: 'POST',
            data: { id: this.roomObjectId },
            success: function (response) {
                this.attachedPath.remove();
            }
        });
    }

    this.showDropDownMenu = function () {
        showScreenTextDropDownMenu(scope.project2ViewX(this.left()), scope.project2ViewY(this.top()), this.text);
    }

    this.saveText = function(text) {
        this.text = text;
        this.save();
        scope.screenTextDropDownText = "";
        scope.screenTextDropDownMenuVisible = false;
        this.getPath();
    }

    this.select = function () {
        this.getPath();
    }

    this.unselect = function () {
        isSelected = false;
        scope.screenTextDropDownMenuVisible = false;
        this.getPath();
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

    this.selectByPoint = function (point, tolerance) {
        if (!this.attachedPath) return false;
        isSelected = point.x >= this.attachedPath.bounds.left && point.x <= this.attachedPath.bounds.left + this.attachedPath.bounds.width
            && point.y >= this.attachedPath.bounds.top && point.y <= this.attachedPath.bounds.top + this.attachedPath.bounds.height;
        if (isSelected) this.select();
        return isSelected;
    }
}