using System.Collections.Generic;
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

        public static RoomModel SaveRoom(RoomModel roomModel)
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.SaveRoomModel(roomModel);
            }
        }

        public static List<EmployeeInfo> GetEmployeesWithoutSeat()
        {
            return new List<EmployeeInfo>
            {
                new EmployeeInfo {Id = 1, FioShort = "Кравчук Л.Н."},
                new EmployeeInfo {Id = 2, FioShort = "Кучма Л.Д."},
                new EmployeeInfo {Id = 3, FioShort = "Ющенко В.А."},
                new EmployeeInfo {Id = 4, FioShort = "Янукович В.Ф"},
                new EmployeeInfo {Id = 5, FioShort = "Ленин В.И."},
                new EmployeeInfo {Id = 6, FioShort = "Сталин И.В."},
                new EmployeeInfo {Id = 7, FioShort = "Хрущев Н.С."},
                new EmployeeInfo {Id = 8, FioShort = "Брежнев Л.И."}
            };
        }

        public static int SaveWall(int roomId, int x1, int y1, int x2, int y2)
        {
            using (var dbRepository = new DbRepository())
            {
                return dbRepository.SaveWall(roomId, x1, y1, x2, y2);
            }
        }
    }
}
