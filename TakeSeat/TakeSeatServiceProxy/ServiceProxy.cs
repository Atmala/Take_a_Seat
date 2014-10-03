﻿using System.Collections.Generic;
using CommonClasses.InfoClasses;
using CommonClasses.Models;
using DbLayer;

namespace TakeSeatServiceProxy
{
    public static class ServiceProxy
    {
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
                return dbRepository.GetRoom(roomId);
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

        public static int SaveWall(int roomId, int roomObjectId, int x1, int y1, int x2, int y2)
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.SaveWall(roomId, roomObjectId, x1, y1, x2, y2);
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
    }
}
