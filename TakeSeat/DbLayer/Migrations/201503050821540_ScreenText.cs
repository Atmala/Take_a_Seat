namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ScreenText : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ScreenTexts",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        LeftTopX = c.Int(nullable: false),
                        LeftTopY = c.Int(nullable: false),
                        Width = c.Int(nullable: false),
                        Text = c.String(nullable: false, maxLength: 4000),
                        RoomObjectId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.RoomObjects", t => t.RoomObjectId)
                .Index(t => t.RoomObjectId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.ScreenTexts", "RoomObjectId", "dbo.RoomObjects");
            DropIndex("dbo.ScreenTexts", new[] { "RoomObjectId" });
            DropTable("dbo.ScreenTexts");
        }
    }
}
