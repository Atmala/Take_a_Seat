using CommonClasses.Database;

namespace DbLayer.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class EmployeeData : DbMigration
    {
        public override void Up()
        {
            using (var db = new TakeSeatDbContext())
            {
                db.Employees.Add(new Employee {FirstName = "Александр", Surname = "Пушкин"});
                db.Employees.Add(new Employee { FirstName = "Михаил", Surname = "Лермонтов"});
                db.Employees.Add(new Employee { FirstName = "Сергей", Surname = "Есенин" });
                db.Employees.Add(new Employee { FirstName = "Александр", Surname = "Блок" });
                db.Employees.Add(new Employee { FirstName = "Борис", Surname = "Пастернак" });
                db.Employees.Add(new Employee { FirstName = "Алексей", Surname = "Толстой" });
                db.Employees.Add(new Employee { FirstName = "Владимир", Surname = "Высоцкий" });
                db.SaveChanges();
            }
        }
        
        public override void Down()
        {
        }
    }
}
