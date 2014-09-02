using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonClasses.Database
{
    public class Employee: IMapping
    {
        [Key]
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
    }
}
