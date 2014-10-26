namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class SubType : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.RoomObjects", "SubType", c => c.Int());
        }
        
        public override void Down()
        {
            DropColumn("dbo.RoomObjects", "SubType");
        }
    }
}
