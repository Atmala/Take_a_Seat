namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Uid : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Employees", "Uid", c => c.String(maxLength: 4000));
            AddColumn("dbo.Employees", "FirstNameEn", c => c.String(maxLength: 4000));
            AddColumn("dbo.Employees", "SurnameEn", c => c.String(maxLength: 4000));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Employees", "SurnameEn");
            DropColumn("dbo.Employees", "FirstNameEn");
            DropColumn("dbo.Employees", "Uid");
        }
    }
}
