using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CommonClasses.Database;

namespace CommonClasses.Results
{
    public class SaveTableResult
    {
        public int RoomObjectId { get; private set; }
        public int LeftTopX { get; private set; }
        public int LeftTopY { get; private set; }

        public SaveTableResult(int roomObjectId, int leftTopX, int leftTopY)
        {
            RoomObjectId = roomObjectId;
            LeftTopX = leftTopX;
            LeftTopY = leftTopY;
        }
    }
}
