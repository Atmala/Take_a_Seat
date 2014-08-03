﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Models
{
    public class RoomObjectModel
    {
        public int Id { get; set; }
        public string RoomObjectType { get; set; }
        public List<PointModel> Points { get; set; }
        public List<RectangleModel> Rectangles { get; set; }

        public RoomObjectModel()
        {
            Points = new List<PointModel>();
            Rectangles = new List<RectangleModel>();
        }
    }
}