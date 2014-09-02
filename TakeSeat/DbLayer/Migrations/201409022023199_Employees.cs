namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Employees : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Employees",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        FirstName = c.String(maxLength: 4000),
                        Surname = c.String(maxLength: 4000),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.EmployeeTableLinks",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        EmployeeId = c.Int(nullable: false),
                        RoomObjectId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Employees", t => t.EmployeeId)
                .ForeignKey("dbo.RoomObjects", t => t.RoomObjectId)
                .Index(t => t.EmployeeId)
                .Index(t => t.RoomObjectId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.EmployeeTableLinks", "RoomObjectId", "dbo.RoomObjects");
            DropForeignKey("dbo.EmployeeTableLinks", "EmployeeId", "dbo.Employees");
            DropIndex("dbo.EmployeeTableLinks", new[] { "RoomObjectId" });
            DropIndex("dbo.EmployeeTableLinks", new[] { "EmployeeId" });
            DropTable("dbo.EmployeeTableLinks");
            DropTable("dbo.Employees");
        }
    }
}
