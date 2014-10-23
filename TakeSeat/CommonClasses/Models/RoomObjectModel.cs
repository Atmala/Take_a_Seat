using System.Collections.Generic;
using System.Security.Permissions;

namespace CommonClasses.Models
{
    public class RoomObjectModel
    {
        public int Id { get; set; }
        public string RoomObjectTypeStr { get; set; }
        public string IdentNumber { get; set; }
        public int Angle { get; set; }
        public List<PointModel> Points { get; set; }
        public List<RectangleModel> Rectangles { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeFio { get; set; }
        public RoomObjectModel()
        {
            Points = new List<PointModel>();
            Rectangles = new List<RectangleModel>();
        }
    }
}