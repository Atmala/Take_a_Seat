using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;

namespace CommonClasses.Database
{
    public class ScreenText: IMapping
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int LeftTopX { get; set; }
        [Required]
        public int LeftTopY { get; set; }
        [Required]
        public int Width { get; set; }
        [Required]
        public string Text { get; set; }
        [Required]
        public int RoomObjectId { get; set; }
        [ForeignKey("RoomObjectId")]
        public RoomObject RoomObject { get; set; }
    }
}
