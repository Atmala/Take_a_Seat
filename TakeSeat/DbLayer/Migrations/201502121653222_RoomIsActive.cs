namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RoomIsActive : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Rooms", "IsActive", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Rooms", "IsActive");
        }
    }
}
