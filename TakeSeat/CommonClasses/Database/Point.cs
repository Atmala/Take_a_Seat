using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Database
{
    public class Point: IMapping
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int X { get; set; }
        [Required]
        public int Y { get; set; }
        [Required]
        public int RoomObjectId { get; set; }
        [ForeignKey("RoomObjectId")]
        public RoomObject RoomObject { get; set; }
        public int Order { get; set; }

    }
}
