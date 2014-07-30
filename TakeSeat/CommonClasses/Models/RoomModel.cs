using System;
using System.Collections.Generic;
using System.Linq;

namespace CommonClasses.Models
{
    public class RoomModel
    {
        private readonly List<Line> _lines = new List<Line>(); 
        public IEnumerable<Line> Lines { get { return _lines.AsEnumerable(); } }

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
            AddLine(new Line(20, 300, 350, 35));
            AddLine(new Line(20, 20, 500, 350));
        }

        public IEnumerable<Line> GetCanvasLines(CanvasParameters parameters)
        {
            return _lines.Select(l => l.TransformLine(parameters));
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
            var parameters = new CanvasParameters(pixelsInSm, -minimumX, -minimumY);
            return GetCanvasLines(parameters);
        }
    }
}
