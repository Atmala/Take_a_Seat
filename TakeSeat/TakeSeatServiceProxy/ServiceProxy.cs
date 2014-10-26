using System;
using System.Collections.Generic;
using CommonClasses.Database;
using CommonClasses.InfoClasses;
using CommonClasses.Models;
using CommonClasses.Params;
using DbLayer;
using NLog;

namespace TakeSeatServiceProxy
{
    public static class ServiceProxy
    {
        private static Logger _logger = LogManager.GetLogger("ServiceProxy");

        public static void CheckAndUpdateDatabaseSchema()
        {
            using (var dbRepository = new DbRepository())
            {
                dbRepository.CheckAndUpdateDatabaseSchema();
            }
        }
        public static RoomModel GetFirstRoom()
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.GetFirstRoom();
            }
        }

        public static RoomModel GetRoom(int roomId)
        {
            using (var dbRepository = new DbRepository())
            {
                try
                {
                    _logger.Info("GetRoom");
                    return dbRepository.GetRoom(roomId);
                }
                catch (Exception e)
                {
                    _logger.Error(e.Message);
                    return null;
                }
            }
        }

        public static RoomModel SaveRoom(RoomModel roomModel)
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.SaveRoomModel(roomModel);
            }
        }

        public static List<EmployeeInfo> GetEmployeesWithoutSeat()
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.GetEmployeesWithoutSeat();
            }
        }

        public static int SaveWall(int roomId, LineInfo lineInfo)
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.SaveWall(roomId, lineInfo);
            }
        }

        public static int SaveTable(int roomId, int roomObjectId, int leftTopX, int leftTopY, int width, int height)
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.SaveTable(roomId, roomObjectId, leftTopX, leftTopY, width, height);
            }
        }

        public static int SaveEmployeeTableLink(EmployeeTableLinkInfo employeeTableLinkInfo)
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.SaveEmployeeTableLink(employeeTableLinkInfo);
            }
        }

        public static void RemoveEmployeeTableLink(EmployeeTableLinkInfo employeeTableLinkInfo)
        {
            using (var dbRepository = new DbRepository())
            {
                dbRepository.RemoveEmployeeTableLink(employeeTableLinkInfo);
            }
        }

        public static void DeleteRoomObject(int id)
        {
            using (var dbRepository = new DbRepository())
            {
                dbRepository.DeleteRoomObject(id);
            }
        }

        public static List<RoomInfo> GetRooms()
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.GetRooms();
            }
        }

        public static RoomInfo CreateNewRoom(string caption)
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.CreateNewRoom(caption);
            }
        }

        public static void SaveIdentNumber(int roomObjectId, string identNumber)
        {
            using (var dbRepository = new DbRepository())
            {
                dbRepository.SaveIdentNumber(roomObjectId, identNumber);
            }
        }

        public static void SaveAngle(SaveAngleParam param)
        {
            using (var dbRepository = new DbRepository())
            {
                dbRepository.SaveAngle(param);
            }
        }

        public static List<SearchElementInfo> GetElementsForSearch()
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.GetElementsForSearch();
            }
        }
    }
}
