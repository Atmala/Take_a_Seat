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
    public class DbRepository: IDisposable
    {
        private TakeSeatDbContext _db = new TakeSeatDbContext();
        public void SaveRoomModel(RoomModel roomModel)
        {
            
        }

        #region GetRoomModel Methods
        public RoomModel GetRoomModel(int roomId)
        {
            RoomModel roomModel;
                var room = _db.Rooms.FirstOrDefault(r => r.Id == roomId);
                if (room == null) return new RoomModel();
                roomModel = new RoomModel
                {
                    Id = room.Id,
                    Caption = room.Caption, 
                    Description = room.Description,
                    Order = room.Order,
                    RoomObjects = GetRoomObjectModels(roomId)
                };
            return roomModel;
        }

        private List<RoomObjectModel> GetRoomObjectModels(int roomId)
        {
            var result = new List<RoomObjectModel>();
            var roomObjects =
                    from ro in _db.RoomObjects
                    join rot in _db.RoomObjectTypes on ro.RoomObjectTypeId equals rot.Id
                    where ro.RoomId == roomId
                    select new { RoomObject = ro, RoomObjectType = rot.Name };

            foreach (var r in roomObjects)
            {
                var roomObjectModel = new RoomObjectModel
                {
                    Id = r.RoomObject.Id,
                    RoomObjectType = r.RoomObjectType,
                    Points = GetPointModels(r.RoomObject.Id),
                    Rectangles = GetRectangleModels(r.RoomObject.Id)
                };
            }
            return result;
        }

        private List<PointModel> GetPointModels(int roomObjectId)
        {
            return (from p in _db.Points
                where p.RoomObjectId == roomObjectId
                orderby p.Order
                select new PointModel
                       {
                           Id = p.Id,
                           X = p.X,
                           Y = p.Y, 
                           Order = p.Order
                       }).ToList();
        }

        private List<RectangleModel> GetRectangleModels(int roomObjectId)
        {
            return (from p in _db.Rectangles
                    where p.RoomObjectId == roomObjectId
                    select new RectangleModel
                    {
                        Id = p.Id,
                        LeftTopX = p.LeftTopX, 
                        LeftTopY = p.LeftTopY,
                        Width = p.Width,
                        Height = p.Height
                    }).ToList();
        }

        #endregion

        public void Dispose()
        {

        }
    }
}
