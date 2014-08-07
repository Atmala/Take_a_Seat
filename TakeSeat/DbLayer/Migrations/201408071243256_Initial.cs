using CommonClasses.Database;

namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Points",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        X = c.Int(nullable: false),
                        Y = c.Int(nullable: false),
                        RoomObjectId = c.Int(nullable: false),
                        Order = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.RoomObjects", t => t.RoomObjectId)
                .Index(t => t.RoomObjectId);
            
            CreateTable(
                "dbo.RoomObjects",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RoomObjectTypeId = c.Int(nullable: false),
                        RoomId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Rooms", t => t.RoomId)
                .ForeignKey("dbo.RoomObjectTypes", t => t.RoomObjectTypeId)
                .Index(t => t.RoomObjectTypeId)
                .Index(t => t.RoomId);
            
            CreateTable(
                "dbo.Rectangles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        LeftTopX = c.Int(nullable: false),
                        LeftTopY = c.Int(nullable: false),
                        Width = c.Int(nullable: false),
                        Height = c.Int(nullable: false),
                        RoomObjectId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.RoomObjects", t => t.RoomObjectId)
                .Index(t => t.RoomObjectId);
            
            CreateTable(
                "dbo.Rooms",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Caption = c.String(maxLength: 200),
                        Description = c.String(maxLength: 1000),
                        Order = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.RoomObjectTypes",
                c => new
                    {
                        Id = c.Int(nullable: false),
                        Name = c.String(nullable: false, maxLength: 100),
                    })
                .PrimaryKey(t => t.Id);
            //InsertData();
        }

        private void InsertData()
        {
            using (var db = new TakeSeatDbContext())
            {
                db.RoomObjectTypes.Add(new RoomObjectType { Id = 1, Name = "Wall"});
                db.RoomObjectTypes.Add(new RoomObjectType { Id = 2, Name = "Table"});
                db.RoomObjectTypes.Add(new RoomObjectType { Id = 3, Name = "Window" });
                db.RoomObjectTypes.Add(new RoomObjectType { Id = 4, Name = "Door" });
                db.SaveChanges();
            }
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.RoomObjects", "RoomObjectTypeId", "dbo.RoomObjectTypes");
            DropForeignKey("dbo.RoomObjects", "RoomId", "dbo.Rooms");
            DropForeignKey("dbo.Rectangles", "RoomObjectId", "dbo.RoomObjects");
            DropForeignKey("dbo.Points", "RoomObjectId", "dbo.RoomObjects");
            DropIndex("dbo.Rectangles", new[] { "RoomObjectId" });
            DropIndex("dbo.RoomObjects", new[] { "RoomId" });
            DropIndex("dbo.RoomObjects", new[] { "RoomObjectTypeId" });
            DropIndex("dbo.Points", new[] { "RoomObjectId" });
            DropTable("dbo.RoomObjectTypes");
            DropTable("dbo.Rooms");
            DropTable("dbo.Rectangles");
            DropTable("dbo.RoomObjects");
            DropTable("dbo.Points");
        }
    }
}
