using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonClasses.Results
{
    public class SaveScreenTextResult
    {
        public int RoomObjectId { get; private set; }
        public int LeftTopX { get; private set; }
        public int LeftTopY { get; private set; }
        public int Width { get; private set; }
        public string Text { get; private set; }

        public SaveScreenTextResult() { }
        public SaveScreenTextResult(int roomObjectId, int leftTopX, int leftTopY, int width, string text)
        {
            RoomObjectId = roomObjectId;
            LeftTopX = leftTopX;
            LeftTopY = leftTopY;
            Width = width;
            Text = text;
        }
    }
}
