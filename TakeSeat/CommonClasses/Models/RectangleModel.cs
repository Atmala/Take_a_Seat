using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonClasses.Database;

namespace CommonClasses.Models
{
    public class RectangleModel
    {
        public int Id { get; set; }
        public int LeftTopX { get; set; }
        public int LeftTopY { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }
}
