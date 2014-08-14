using CommonClasses.Database;

namespace DbLayer.Migrations
{
    using System.Data.Entity.Migrations;
    
    public partial class InsertInitialData : DbMigration
    {
        public override void Up()
        {
            using (var db = new TakeSeatDbContext())
            {
                db.RoomObjectTypes.Add(new RoomObjectType { Id = 1, Name = "Wall" });
                db.RoomObjectTypes.Add(new RoomObjectType { Id = 2, Name = "Table" });
                db.RoomObjectTypes.Add(new RoomObjectType { Id = 3, Name = "Window" });
                db.RoomObjectTypes.Add(new RoomObjectType { Id = 4, Name = "Door" });
                db.SaveChanges();
            }
        }
        
        public override void Down()
        {
        }
    }
}
