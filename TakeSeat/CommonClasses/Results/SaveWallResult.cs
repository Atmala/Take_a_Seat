using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CommonClasses.Database;
using CommonClasses.Models;

namespace CommonClasses.Results
{
    public class SaveWallResult
    {
        public int Id { get; private set; }
        public int? SubType { get; set; }
        public List<PointModel> Points { get; private set; }

        public SaveWallResult() { }
        public SaveWallResult(int roomObjectId, int? subType, List<PointModel> points)
        {
            Id = roomObjectId;
            SubType = subType;
            Points = points;
        }
    }
}
