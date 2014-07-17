using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonClasses.Database;

namespace DbLayer
{
    public class TakeSeatDbContext: DbContext
    {
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomObject> RoomObjects { get; set; }
        public DbSet<RoomObjectType> RoomObjectTypes { get; set; }
        public DbSet<Point> Points { get; set; }
        public DbSet<Rectangle> Rectangles { get; set; }
    }
}
