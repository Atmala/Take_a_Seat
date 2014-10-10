namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class IdentNumber : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.RoomObjects", "IdentNumber", c => c.String(maxLength: 4000));
        }
        
        public override void Down()
        {
            DropColumn("dbo.RoomObjects", "IdentNumber");
        }
    }
}
