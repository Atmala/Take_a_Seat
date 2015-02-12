namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class FillIsActive : DbMigration
    {
        public override void Up()
        {
            using (var dbRepository = new DbRepository())
            {
                dbRepository.MakeAllRoomsActive();
            }
        }
        
        public override void Down()
        {
        }
    }
}
