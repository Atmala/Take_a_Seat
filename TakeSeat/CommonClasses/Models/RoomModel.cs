using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Models
{
    public class RoomModel
    {
        public int Id { get; set; }
        public string Caption { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }
        public List<RoomObjectModel> RoomObjects { get; set; }

        public RoomModel()
        {
            RoomObjects = new List<RoomObjectModel>();
        }

        public void CreateTestData()
        {
            RoomObjects.Add(
                new RoomObjectModel
                {
                    RoomObjectType = "wall",
                    Points = new List<PointModel>
                             {
                                 new PointModel{X = 10, Y = 10},
                                 new PointModel{X = 200, Y = 200}
                             }
                });
        }
    }
}
