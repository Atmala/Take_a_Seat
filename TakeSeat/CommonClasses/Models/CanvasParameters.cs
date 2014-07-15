using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Models
{
    public class CanvasParameters
    {
        public decimal PixelsInSm { get; private set; }
        public int ShiftX { get; private set; }
        public int ShiftY { get; private set; }

        public CanvasParameters(decimal pixelsInSm, int shiftX, int shiftY)
        {
            PixelsInSm = pixelsInSm;
            ShiftX = shiftX;
            ShiftY = shiftY;
        }
    }
}
