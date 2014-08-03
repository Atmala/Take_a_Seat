using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Models
{
    public class RoomModel2
    {
        public int Id { get; set; }
        public string Caption { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }
        public List<RoomObjectModel> RoomObjects { get; set; }

        public RoomModel2()
        {
            RoomObjects = new List<RoomObjectModel>();
        }
    }
}
