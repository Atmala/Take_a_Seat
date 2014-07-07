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
    }
}
