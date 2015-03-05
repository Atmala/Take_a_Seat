function ScreenTextObject(scope, mapProvider) {
    this.createNew = function(x, y, text) {
        this.leftTopX = scope.view2ProjectX(x);
        this.leftTopY = scope.view2ProjectY(y);
        this.text = text;
    }

    this.getPath = function () {
        if (this.caption) this.caption.remove();
        var style = {
            fitToCenter: true,
            fontSize: 14,
            fontweight: this.isFoundItem ? 900 : 300,
            fontColor: this.isFoundItem ? scope.foundColor : scope.fontColor
        };
        this.caption = getPointText(scope.project2ViewX(this.leftTopX), scope.project2ViewY(this.leftTopY), style, this.text);
        this.width = Math.round(this.caption.bounds.width);
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
}