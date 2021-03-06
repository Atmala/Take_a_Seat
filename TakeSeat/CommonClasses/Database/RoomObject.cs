﻿using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CommonClasses.Database
{
    public class RoomObject: IMapping
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int RoomObjectTypeId { get; set; }
        [ForeignKey("RoomObjectTypeId")]
        public RoomObjectType RoomObjectType { get; set; }
        public string IdentNumber { get; set; }
        [Required]
        [DefaultValue(0)]
        public int Angle { get; set; }
        public int? SubType { get; set; }

        [Required]
        public int RoomId { get; set; }
        [ForeignKey("RoomId")]
        public Room Room { get; set; }

        public List<Point> Points { get; set; }

        public List<Rectangle> Rectangles { get; set; } 
    }
}
