function getPointText(x, y, style, str) {
    return new PointText({
        point: [x, y],
        content: str,
        fillColor: style.fontColor,
        fontFamily: 'Comic Sans MS',
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
    var pointText = getPointText(rect.left, rect.top, style, str);
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