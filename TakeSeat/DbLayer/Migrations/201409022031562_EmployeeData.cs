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
                db.Employees.Add(new Employee {FirstName = "���������", Surname = "������"});
                db.Employees.Add(new Employee { FirstName = "������", Surname = "���������"});
                db.Employees.Add(new Employee { FirstName = "������", Surname = "������" });
                db.Employees.Add(new Employee { FirstName = "���������", Surname = "����" });
                db.Employees.Add(new Employee { FirstName = "�����", Surname = "���������" });
                db.Employees.Add(new Employee { FirstName = "�������", Surname = "�������" });
                db.Employees.Add(new Employee { FirstName = "��������", Surname = "��������" });
                db.SaveChanges();
            }
        }
        
        public override void Down()
        {
        }
    }
}
