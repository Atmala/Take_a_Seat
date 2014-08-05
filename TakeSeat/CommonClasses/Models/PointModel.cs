using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonClasses.Database;

namespace CommonClasses.Models
{
    public class PointModel
    {
        public int Id { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Order { get; set; }
    }
}
