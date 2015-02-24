using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;

namespace CommonClasses.Database
{
    public class AdminUser
    {
        [Key]
        public int Id { get; set; }
        public string UserName { get; set; }
    }
}
