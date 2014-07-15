using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Database
{
    public class Point
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int X { get; set; }
        [Required]
        public int Y { get; set; }

    }
}
