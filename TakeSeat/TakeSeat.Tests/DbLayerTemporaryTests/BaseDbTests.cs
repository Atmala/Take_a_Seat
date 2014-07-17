using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.UI.WebControls;
using CommonClasses.Database;
using DbLayer;
using NUnit.Framework;

namespace TakeSeat.Tests.DbLayerTemporaryTests
{
    [TestFixture]
    public class BaseDbTests
    {
        [Test]
        public void CallDbTest()
        {
            using (var db = new TakeSeatDbContext())
            {
                db.Rooms.Add(new Room {Caption = "Test Room", Order = 1});
                db.SaveChanges();
            }
        }
    }
}
