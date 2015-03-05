using System.Linq;
using CommonClasses.Database;

namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ScreenTextType : DbMigration
    {
        public override void Up()
        {
            using (var db = new TakeSeatDbContext())
            {
                db.RoomObjectTypes.Add(new RoomObjectType {Id = 5, Name = "ScreenText"});
                db.SaveChanges();
            }
        }
        
        public override void Down()
        {
            using (var db = new TakeSeatDbContext())
            {
                var roomObjectType = db.RoomObjectTypes.SingleOrDefault(r => r.Id == 5);
                if (roomObjectType != null)
                    db.RoomObjectTypes.Remove(roomObjectType);
                db.SaveChanges();
            }
        }
    }
}
