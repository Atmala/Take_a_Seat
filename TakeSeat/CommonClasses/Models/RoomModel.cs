using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            AddLine(new Line(-100, -100, 100, -100));
            AddLine(new Line(100, -100, 100, 100));
            AddLine(new Line(100, 100, -100, 100));
            AddLine(new Line(-100, 100, -100, -100));
            AddLine(new Line(-50, -100, -50, 0));
            AddLine(new Line(-50, 0, 50, 0));
            AddLine(new Line(50, 0, 50, -100));
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
