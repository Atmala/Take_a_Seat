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
                var room = new Room {Caption = "Test Room", Order = 1};
                db.Rooms.Add(room);
                db.SaveChanges();

                var roomObject = new RoomObject { RoomObjectTypeId = 2, RoomId = room.Id };
                db.RoomObjects.Add(roomObject);
                db.SaveChanges();
            }
        }
        [Test]
        public void ReadRoom()
        {
            using (var db = new TakeSeatDbContext())
            {
                var roomId = db.Rooms.Max(r => r.Id);
                db.Configuration.LazyLoadingEnabled = true;
                var room = db.Rooms.FirstOrDefault(r => r.Id == roomId);
            }
        }
    }
}
