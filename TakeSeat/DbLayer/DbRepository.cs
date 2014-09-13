using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Metadata.Edm;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using CommonClasses.Database;
using CommonClasses.Helpers;
using CommonClasses.InfoClasses;
using CommonClasses.Models;

namespace DbLayer
{
    public class DbRepository: IDisposable
    {
        private TakeSeatDbContext _db = new TakeSeatDbContext();

        #region Save

        public int Save<T>(T obj) where T : class, IMapping
        {
            int id = obj.Id;
            if (id == 0)
            {
                _db.Add(obj);
            }
            else
            {
                var record = _db.GetById<T>(id);
                ReflectionHelper.CopyAllProperties(obj, record);
            }
            _db.SaveChanges();

            return obj.Id;
        }

        #endregion

        #region RoomObjectType

        private List<RoomObjectType> _roomObjectTypes;
        private List<RoomObjectType> RoomObjectTypes
        {
            get
            {
                return _roomObjectTypes ?? (_roomObjectTypes = _db.RoomObjectTypes.ToList());
            }
        }

        private int GetRoomObjectTypeId(string name)
        {
            var roomObjectType = RoomObjectTypes.
                FirstOrDefault(r => r.Name.Equals(name, StringComparison.CurrentCultureIgnoreCase));
            return roomObjectType == null ? 0 : roomObjectType.Id;
        }

        #endregion

        #region SaveRoomModel Methods
        private void SaveRoomObjectModel(RoomObjectModel roomObjectModel, int roomId)
        {
            var roomObject = new RoomObject();
            ReflectionHelper.CopyAllProperties(roomObjectModel, roomObject);
            roomObject.RoomId = roomId;
            roomObject.RoomObjectTypeId = GetRoomObjectTypeId(roomObjectModel.RoomObjectTypeStr);
            Save(roomObject);
            foreach (var pointModel in roomObjectModel.Points)
            {
                var point = new Point();
                ReflectionHelper.CopyAllProperties(pointModel, point);
                point.RoomObjectId = roomObject.Id;
                Save(point);
            }
            foreach (var rectangleModel in roomObjectModel.Rectangles)
            {
                var rectangle = new Rectangle();
                ReflectionHelper.CopyAllProperties(rectangleModel, rectangle);
                rectangle.RoomObjectId = roomObject.Id;
                Save(rectangle);
            }
        }
        public RoomModel SaveRoomModel(RoomModel roomModel)
        {
            var room = new Room();
            ReflectionHelper.CopyAllProperties(roomModel, room);
            Save(room);
            foreach (var roomObjectModel in roomModel.RoomObjects)
            {
                SaveRoomObjectModel(roomObjectModel, room.Id);
            }
            return GetRoomModel(room.Id);
        }

        #endregion

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
                    from etl in _db.EmployeeTableLinks.Where(e => e.RoomObjectId == ro.Id).DefaultIfEmpty()
                    from emp in _db.Employees.Where(e => e.Id == etl.EmployeeId).DefaultIfEmpty()
                    where ro.RoomId == roomId
                    select new
                           {
                               RoomObject = ro, 
                               RoomObjectType = rot.Name,
                               Employee = emp
                           };

            foreach (var r in roomObjects)
            {
                var roomObjectModel = new RoomObjectModel
                {
                    Id = r.RoomObject.Id,
                    RoomObjectTypeStr = r.RoomObjectType,
                    Points = GetPointModels(r.RoomObject.Id),
                    Rectangles = GetRectangleModels(r.RoomObject.Id),
                    EmployeeId = r.Employee == null ? 0 : r.Employee.Id,
                    EmployeeFio = r.Employee == null ? string.Empty : r.Employee.Surname + " " + r.Employee.FirstName
                };
                result.Add(roomObjectModel);
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
                        RoomObjectId = roomObjectId, 
                        LeftTopX = p.LeftTopX, 
                        LeftTopY = p.LeftTopY,
                        Width = p.Width,
                        Height = p.Height
                    }).ToList();
        }

        #endregion

        #region Save Separate Objects

        private int SavePoint(int roomObjectId, int x, int y)
        {
            var point = new Point
                        {
                            RoomObjectId = roomObjectId,
                            X = x, 
                            Y = y
                        };
            return Save(point);
        }

        private int SaveRectangle(int roomObjectId, int leftTopX, int leftTopY, int width, int height)
        {
            var rectangle = new Rectangle
                {
                    RoomObjectId = roomObjectId, 
                    LeftTopX = leftTopX, 
                    LeftTopY = leftTopY, 
                    Width = width, 
                    Height = height
                };
            return Save(rectangle);
        }

        public int SaveWall(int roomId, int x1, int y1, int x2, int y2)
        {
            var roomObject = new RoomObject()
                             {
                                 RoomId = roomId,
                                 RoomObjectTypeId = GetRoomObjectTypeId("wall")
                             };
            int roomObjectId = Save(roomObject);
            SavePoint(roomObjectId, x1, y1);
            SavePoint(roomObjectId, x2, y2);
            return roomObjectId;
        }

        public int SaveTable(int roomId, int leftTopX, int leftTopY, int width, int height)
        {
            var roomObject = new RoomObject()
            {
                RoomId = roomId,
                RoomObjectTypeId = GetRoomObjectTypeId("table")
            };
            int roomObjectId = Save(roomObject);
            SaveRectangle(roomObjectId, leftTopX, leftTopY, width, height);
            return roomObjectId;
        }

        private void DeleteOtherEmployeeTableLinks(int employeeId, int roomObjectId)
        {
            var links = (from etl in _db.EmployeeTableLinks
                         where etl.EmployeeId == employeeId && etl.RoomObjectId != roomObjectId
                              || etl.RoomObjectId == roomObjectId && etl.EmployeeId != employeeId
                         select etl);
            foreach (var link in links)
            {
                _db.EmployeeTableLinks.Remove(link);
            }
            _db.SaveChanges();
        }

        public int SaveEmployeeTableLink(EmployeeTableLinkInfo employeeTableLinkInfo)
        {
            DeleteOtherEmployeeTableLinks(employeeTableLinkInfo.EmployeeId, employeeTableLinkInfo.RoomObjectId);

            var link = (from etl in _db.EmployeeTableLinks
                where etl.EmployeeId == employeeTableLinkInfo.EmployeeId
                      && etl.RoomObjectId == employeeTableLinkInfo.RoomObjectId
                select etl).FirstOrDefault();
            
            if (link == null)
            {
                link = new EmployeeTableLink
                       {
                           EmployeeId = employeeTableLinkInfo.EmployeeId,
                           RoomObjectId = employeeTableLinkInfo.RoomObjectId
                       };
                Save(link);
            }
            return link.Id;
        }

        #endregion

        #region Get Methods
        public RoomModel GetFirstRoom()
        {
            var room = _db.Rooms.FirstOrDefault();
            return room == null ? null : GetRoomModel(room.Id);
        }

        public List<EmployeeInfo> GetEmployeesWithoutSeat()
        {
            return (from e in _db.Employees
                    where !_db.EmployeeTableLinks.Any(etl => etl.EmployeeId == e.Id)
                    select new EmployeeInfo
                       {
                           Id = e.Id,
                           FioShort = e.Surname + (string.IsNullOrEmpty(e.FirstName) ? ""
                               : " " + e.FirstName)
                       }).ToList();
        }

        #endregion

        public void Dispose()
        {
            if (_db != null) _db.Dispose();
        }
    }
}
