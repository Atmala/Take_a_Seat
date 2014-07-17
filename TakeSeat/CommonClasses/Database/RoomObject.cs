using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Database
{
    public class RoomObject
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int RoomObjectTypeId { get; set; }
        [ForeignKey("RoomObjectTypeId")]
        public RoomObjectType RoomObjectType { get; set; }

        [Required]
        public int RoomId { get; set; }
        [ForeignKey("RoomId")]
        public Room Room { get; set; }

        public List<Point> Points { get; set; }

        public List<Rectangle> Rectangles { get; set; } 
    }
}
