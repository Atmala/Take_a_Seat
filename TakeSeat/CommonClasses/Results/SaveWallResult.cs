using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CommonClasses.Database;

namespace CommonClasses.Results
{
    public class SaveWallResult
    {
        public int RoomObjectId { get; private set; }
        public int X1 { get; private set; }
        public int Y1 { get; private set; }
        public int X2 { get; private set; }
        public int Y2 { get; private set; }

        public SaveWallResult() { }
        public SaveWallResult(int roomObjectId, int x1, int y1, int x2, int y2)
        {
            RoomObjectId = roomObjectId;
            X1 = x1;
            Y1 = y1;
            X2 = x2;
            Y2 = y2;
        }
    }
}
