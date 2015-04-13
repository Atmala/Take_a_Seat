function DbProvider() {
    this.saveWall = function(wallRoomObject) {
        $.ajax({
            url: window.saveWallPath,
            type: 'POST',
            data: wallRoomObject.getSaveArgument(),
            success: function (response) {
                wallRoomObject.loadFromDb(response);
                wallRoomObject.getPath();
            }
        });
    }

    this.deleteWall = function(wallRoomObject) {
        $.ajax({
            url: window.deleteRoomObjectPath,
            type: 'POST',
            data: { id: wallRoomObject.getRoomObjectId() },
            success: function () {
                wallRoomObject.onDelete();
            }
        });
    }
}