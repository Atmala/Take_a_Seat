function ScreenTextObject(scope, mapProvider) {
    this.RoomObjectType = 'screentext';

    this.createNew = function (x, y, text) {
        this.leftTopX = scope.view2ProjectX(x);
        this.leftTopY = scope.view2ProjectY(y);
        this.text = text;
    }

    this.getPath = function () {
        if (this.attachedPath) this.attachedPath.remove();
        var style = {
            fitToCenter: true,
            fontSize: Math.min(16 * scope.scale, 16),
            fontweight: this.isFoundItem ? 900 : 300,
            fontColor: this.isFoundItem ? scope.foundColor : scope.fontColor
        };
        this.attachedPath = getPointText(scope.project2ViewX(this.leftTopX), scope.project2ViewY(this.leftTopY), style, this.text);
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

    this.updatePosition = function() {
        this.attachedPath.point.x = scope.project2ViewX(this.leftTopX);
        this.attachedPath.point.y = scope.project2ViewY(this.leftTopY);
    }

    this.left = function () {
        return this.leftTopX;
    }

    this.top = function () {
        return this.leftTopY;
    }

    this.right = function () {
        return this.leftTopX + this.attachedPath.bounds.width;
    }

    this.bottom = function () {
        return this.leftTopY + this.attachedPath.bounds.height;
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
        scope.screenTextDroppedDown = this.attachedPath;
        scope.showScreenTextDropDownMenu(scope.project2ViewX(this.left()), scope.project2ViewY(this.bottom()), this.text);
    }

    this.saveText = function(text) {
        this.text = text;
        this.save();
        this.getPath();
    }
}