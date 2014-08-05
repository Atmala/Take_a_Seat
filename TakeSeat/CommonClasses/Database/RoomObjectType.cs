using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Database
{
    public class RoomObjectType: IMapping
    {
        [Key]
        public int Id { get; set; }
        [StringLength(100)]
        [Required]
        public string Name { get; set; }
    }
}
