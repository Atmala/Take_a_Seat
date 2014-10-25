using System;
using System.Collections.Generic;
using System.Data.Entity;
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
using CommonClasses.Params;
using DbLayer.Migrations;

namespace DbLayer
{
    public class DbRepository: IDisposable
    {
        private TakeSeatDbContext _db = new TakeSeatDbContext();

        public void CheckAndUpdateDatabaseSchema()
        {
            Database.SetInitializer(new TakeSeatDbContextInitializer());
        }

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

        private RoomObjectModel GetRoomObjectModel(RoomObject roomObject, Employee employee)
        {
           return new RoomObjectModel
            {
                Id = roomObject.Id,
                RoomObjectTypeStr = RoomObjectTypes.First(t => t.Id == roomObject.RoomObjectTypeId).Name,
                IdentNumber = roomObject.IdentNumber,
                Angle = roomObject.Angle,
                Points = GetPointModels(roomObject.Id),
                Rectangles = GetRectangleModels(roomObject.Id),
                EmployeeId = employee == null ? 0 : employee.Id,
                EmployeeFio = employee == null ? string.Empty : employee.Surname + " " + employee.FirstName
            };
        }
        private List<RoomObjectModel> GetRoomObjectModels(int roomId)
        {
            var result = new List<RoomObjectModel>();
            var roomObjects =
                    from ro in _db.RoomObjects
                    from etl in _db.EmployeeTableLinks.Where(e => e.RoomObjectId == ro.Id).DefaultIfEmpty()
                    from emp in _db.Employees.Where(e => e.Id == etl.EmployeeId).DefaultIfEmpty()
                    where ro.RoomId == roomId
                    select new
                           {
                               RoomObject = ro, 
                               Employee = emp
                           };

            foreach (var r in roomObjects)
            {
                result.Add(GetRoomObjectModel(r.RoomObject, r.Employee));
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

        public int SaveWall(int roomId, int roomObjectId, int x1, int y1, int x2, int y2)
        {
            return roomObjectId == 0
                ? SaveNewWall(roomId, x1, y1, x2, y2)
                : UpdateWall(roomObjectId, x1, y1, x2, y2);
        }

        private int SaveNewWall(int roomId, int x1, int y1, int x2, int y2)
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

        private int UpdateWall(int roomObjectId, int x1, int y1, int x2, int y2)
        {
            var points = _db.Points.Where(r => r.RoomObjectId == roomObjectId).ToList();
            if (points.Count != 2) return -1;
            points[0].X = x1;
            points[0].Y = y1;
            Save(points[0]);
            points[1].X = x2;
            points[1].Y = y2;
            Save(points[1]);
            _db.SaveChanges();
            return roomObjectId;
        }

        private int SaveNewTable(int roomId, int leftTopX, int leftTopY, int width, int height)
        {
            var roomObject = new RoomObject()
            {
                RoomId = roomId,
                RoomObjectTypeId = GetRoomObjectTypeId("table")
            };
            var roomObjectId = Save(roomObject);
            SaveRectangle(roomObjectId, leftTopX, leftTopY, width, height);
            return roomObjectId;
        }

        private int UpdateTable(int roomObjectId, int leftTopX, int leftTopY, int width, int height)
        {
            var rectangle = _db.Rectangles.Single(r => r.RoomObjectId == roomObjectId);
            rectangle.LeftTopX = leftTopX;
            rectangle.LeftTopY = leftTopY;
            rectangle.Width = width;
            rectangle.Height = height;
            Save(rectangle);
            return roomObjectId;
        }

        public int SaveTable(int roomId, int roomObjectId, int leftTopX, int leftTopY, int width, int height)
        {
            return roomObjectId == 0
                ? SaveNewTable(roomId, leftTopX, leftTopY, width, height)
                : UpdateTable(roomObjectId, leftTopX, leftTopY, width, height);
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

        public void RemoveEmployeeTableLink(EmployeeTableLinkInfo employeeTableLinkInfo)
        {
            var link = (from etl in _db.EmployeeTableLinks
                        where etl.EmployeeId == employeeTableLinkInfo.EmployeeId
                              && etl.RoomObjectId == employeeTableLinkInfo.RoomObjectId
                        select etl).FirstOrDefault();

            if (link != null)
            {
                _db.EmployeeTableLinks.Remove(link);
                _db.SaveChanges();
            }
        }

        public RoomInfo CreateNewRoom(string caption)
        {
            var room = new Room {Caption = caption, Order = 0};
            Save(room);
            return new RoomInfo
                   {
                       Id = room.Id,
                       Caption = room.Caption
                   };
        }

        public void SaveIdentNumber(int roomObjectId, string identNumber)
        {
            var roomObject = _db.RoomObjects.FirstOrDefault(r => r.Id == roomObjectId);
            if (roomObject == null) return;
            roomObject.IdentNumber = string.IsNullOrEmpty(identNumber) ? null : identNumber;
            Save(roomObject);
        }

        public void SaveAngle(SaveAngleParam param)
        {
            var roomObject = _db.RoomObjects.FirstOrDefault(r => r.Id == param.RoomObjectId);
            if (roomObject == null) return;
            roomObject.Angle = param.Angle;
            Save(roomObject);
        }

        #endregion

        #region Get Methods
        public RoomModel GetFirstRoom()
        {
            var room = _db.Rooms.FirstOrDefault();
            return room == null ? null : GetRoomModel(room.Id);
        }

        public RoomModel GetRoom(int roomId)
        {
            return GetRoomModel(roomId);
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

        private string GetSearchLabel(string fioShort, string identNumber)
        {
            var result = new StringBuilder();
            if (!string.IsNullOrEmpty(fioShort))
            {
                result.Append(fioShort);
                if (!string.IsNullOrEmpty(identNumber))
                    result.Append(" ");
            }
            if (!string.IsNullOrEmpty(identNumber))
                result.Append("[" + identNumber + "]");
            return result.ToString();
        }

        public List<SearchElementInfo> GetElementsForSearch()
        {
            var result =
                (from e in _db.Employees
                    from etl in _db.EmployeeTableLinks.Where(r => r.EmployeeId == e.Id).DefaultIfEmpty()
                    from ro in _db.RoomObjects.Where(r => r.Id == etl.RoomObjectId).DefaultIfEmpty()
                    select new { Employee = e, RoomObject = ro}).AsEnumerable().
                Select(r => new
                           {
                               RoomId = r.RoomObject == null ? 0 : r.RoomObject.RoomId,
                               EmployeeId = r.Employee.Id, 
                               RoomObjectId = r.RoomObject == null ? 0 : r.RoomObject.Id,
                               FioShort = r.Employee.Surname + " " + r.Employee.FirstName,
                               IdentNumber = r.RoomObject == null ? string.Empty : r.RoomObject.IdentNumber
                           }).ToList();
            result.AddRange(
                from ro in _db.RoomObjects
                where !_db.EmployeeTableLinks.Any(etl => etl.RoomObjectId == ro.Id)
                    && ro.IdentNumber != "" && ro.IdentNumber != null
                select new
                       {
                           ro.RoomId, 
                           EmployeeId = 0,
                           RoomObjectId = ro.Id,
                           FioShort = "",
                           ro.IdentNumber
                       });
            return result.Select(r => new SearchElementInfo
                                 {
                                     RoomId = r.RoomId,
                                     EmployeeId = r.EmployeeId,
                                     RoomObjectId = r.RoomObjectId,
                                     label = GetSearchLabel(r.FioShort, r.IdentNumber)
                                 }).ToList();
        }

        public List<RoomInfo> GetRooms()
        {
            return (from r in _db.Rooms
                select new RoomInfo
                {
                    Id = r.Id,
                    Caption = r.Caption
                }).ToList();
        }

        #endregion

        #region Delete Methods

        private void DeleteAllEmployeeTableLinks(int roomObjectId)
        {
            foreach (var employeeTableLink in _db.EmployeeTableLinks.Where(etl => etl.RoomObjectId == roomObjectId))
            {
                _db.EmployeeTableLinks.Remove(employeeTableLink);
            }
        }

        private void DeleteAllRectangles(int roomObjectId)
        {
            foreach (var rectangle in _db.Rectangles.Where(r => r.RoomObjectId == roomObjectId))
            {
                _db.Rectangles.Remove(rectangle);
            }
        }

        private void DeleteAllPoints(int roomObjectId)
        {
            foreach (var point in _db.Points.Where(r => r.RoomObjectId == roomObjectId))
            {
                _db.Points.Remove(point);
            }
        }
        public void DeleteRoomObject(int roomObjectId)
        {
            DeleteAllEmployeeTableLinks(roomObjectId);
            DeleteAllRectangles(roomObjectId);
            DeleteAllPoints(roomObjectId);
            var roomObject = _db.RoomObjects.FirstOrDefault(ro => ro.Id == roomObjectId);
            if (roomObject != null) _db.RoomObjects.Remove(roomObject);
            _db.SaveChanges();
        }

        #endregion

        public void Dispose()
        {
            if (_db != null) _db.Dispose();
        }
    }
}
