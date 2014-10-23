using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbLayer.Migrations
{
    internal class TakeSeatDbContextInitializer: MigrateDatabaseToLatestVersion<TakeSeatDbContext, Configuration>
    {
    }
}
