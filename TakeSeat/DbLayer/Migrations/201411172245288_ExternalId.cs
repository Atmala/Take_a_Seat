namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ExternalId : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Employees", "ExternalId", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Employees", "ExternalId");
        }
    }
}
