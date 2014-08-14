using System.Collections.Generic;

namespace CommonClasses.Models
{
    public class RoomObjectModel
    {
        public int Id { get; set; }
        public string RoomObjectTypeStr { get; set; }
        public List<PointModel> Points { get; set; }
        public List<RectangleModel> Rectangles { get; set; }
        public int EmployeeId { get; set; }
        public RoomObjectModel()
        {
            Points = new List<PointModel>();
            Rectangles = new List<RectangleModel>();
        }
    }
}