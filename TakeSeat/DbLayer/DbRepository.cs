using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Metadata.Edm;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using CommonClasses.Models;

namespace DbLayer
{
    public class DbRepository
    {
        public void SaveRoomModel(RoomModel roomModel)
        {
            
        }

        public RoomModel2 GetRoomModel(int roomId)
        {
            RoomModel2 roomModel;
            using (var db = new TakeSeatDbContext())
            {
                var room = db.Rooms.FirstOrDefault(r => r.Id == roomId);
                if (room == null) return new RoomModel2();
                roomModel = new RoomModel2
                {
                    Id = room.Id,
                    Caption = room.Caption, 
                    Description = room.Description,
                    Order = room.Order
                };
                var roomObjects =
                    from ro in db.RoomObjects
                    join rot in db.RoomObjectTypes on ro.RoomObjectTypeId equals rot.Id
                    where ro.RoomId == roomId
                    select new {RoomObject = ro, RoomObjectType = rot.Name};
                
                foreach (var r in roomObjects)
                {
                    var roomObjectModel = new RoomObjectModel
                    {
                        Id = r.RoomObject.Id, 
                        RoomObjectType = r.RoomObjectType
                    };
                }
            }
            return roomModel;
        }
    }
}
