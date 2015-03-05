function ScreenTextObject(scope, mapProvider) {
    this.createNew = function(x, y, text) {
        this.x = scope.view2ProjectX(x);
        this.y = scope.view2ProjectY(y);
        this.text = text;
    }

    this.getPath = function() {
        var style = {
            fitToCenter: true,
            fontSize: 14,
            fontweight: this.isFoundItem ? 900 : 300,
            fontColor: this.isFoundItem ? scope.foundColor : scope.fontColor
        };
        this.caption = getPointText(scope.project2ViewX(this.x), scope.project2ViewY(this.y), style, this.text);
        this.width = caption.bounds.width;
    }
}