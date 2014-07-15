using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Models
{
    public class Line
    {
        public int X1 { get; private set; }
        public int Y1 { get; private set; }
        public int X2 { get; private set; }
        public int Y2 { get; private set; }

        public Line(int x1, int y1, int x2, int y2)
        {
            X1 = x1;
            Y1 = y1;
            X2 = x2;
            Y2 = y2;
        }

        public Line TransformLine(CanvasParameters parameters)
        {
            return new Line(
                (int)(X1 * parameters.PixelsInSm) + parameters.ShiftX,
                (int)(Y1 * parameters.PixelsInSm) + parameters.ShiftY, 
                (int)(X2 * parameters.PixelsInSm) + parameters.ShiftX,
                (int)(Y2 * parameters.PixelsInSm) + parameters.ShiftY);
        }
    }
}
