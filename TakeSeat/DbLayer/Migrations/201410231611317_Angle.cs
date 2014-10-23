namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Angle : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.RoomObjects", "Angle", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.RoomObjects", "Angle");
        }
    }
}
