using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CommonClasses.Database
{
    public class Room
    {
        [Key]
        public int Id { get; set; }
        [StringLength(200)]
        public string Caption { get; set; }
        [StringLength(1000)]
        public string Description { get; set; }
        [Required]
        public int Order { get; set; }

        public List<RoomObject> RoomObjects { get; set; } 
    }
}
