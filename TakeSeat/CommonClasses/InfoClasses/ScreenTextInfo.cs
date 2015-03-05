﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.InfoClasses
{
    public class ScreenTextInfo
    {
        public int RoomId { get; set; }
        public int RoomObjectId { get; set; }
        public int LeftTopX { get; set; }
        public int LeftTopY { get; set; }
        public int Width { get; set; }
        public string Text { get; set; }
    }
}
