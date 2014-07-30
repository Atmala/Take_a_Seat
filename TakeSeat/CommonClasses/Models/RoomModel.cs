using System;
using System.Collections.Generic;
using System.Linq;

namespace CommonClasses.Models
{
    public class RoomModel
    {
        private readonly List<Line> _lines = new List<Line>(); 
        public IEnumerable<Line> Lines { get { return _lines.AsEnumerable(); } }
        public CanvasParameters Parameters { get; private set; }

        public void AddLine(Line line)
        {
            _lines.Add(line);
        }

        public void Clear()
        {
            _lines.Clear();
        }

        public void CreateTestData()
        {
            Clear();
            AddLine(new Line(-100, -100, 100, -100));
            AddLine(new Line(100, -100, 100, 100));
            AddLine(new Line(100, 100, -100, 100));
            AddLine(new Line(-100, 100, -100, -100));
            AddLine(new Line(-50, -100, -50, 0));
            AddLine(new Line(-50, 0, 50, 0));
            AddLine(new Line(50, 0, 50, -100));
        }

        public IEnumerable<Line> GetCanvasLines()
        {
            return _lines.Select(l => l.TransformLine(Parameters));
        }

        public IEnumerable<Line> GetCanvasLines(int canvasWidth, int canvasHeight)
        {
            int minimumX = _lines.Min(l => Math.Min(l.X1, l.X2));
            int maximumX = _lines.Max(l => Math.Max(l.X1, l.X2));
            int width = maximumX - minimumX;

            int minimumY = _lines.Min(l => Math.Min(l.Y1, l.Y2));
            int maximumY = _lines.Max(l => Math.Max(l.Y1, l.Y2));
            int height = maximumY - minimumY;

            decimal pixelsInSm = Math.Min((decimal) canvasWidth/width, (decimal) canvasHeight/height);
            Parameters = new CanvasParameters(pixelsInSm, 
                (int)(-minimumX * pixelsInSm), 
                (int)(-minimumY * pixelsInSm));
            return GetCanvasLines();
        }

        public void AddNewLine(int canvasX1, int canvasY1, int canvasX2, int canvasY2)
        {
            var line = new Line(
                (int)((canvasX1 - Parameters.ShiftX)/Parameters.PixelsInSm),
                (int)((canvasY1 - Parameters.ShiftY)/Parameters.PixelsInSm),
                (int)((canvasX2 - Parameters.ShiftX)/Parameters.PixelsInSm),
                (int)((canvasY2 - Parameters.ShiftY)/Parameters.PixelsInSm));
            _lines.Add(line);
        }
    }
}
