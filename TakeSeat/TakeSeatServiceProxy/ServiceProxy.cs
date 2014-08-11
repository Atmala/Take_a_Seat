using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonClasses.Database;
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

        public static void SaveRoom(RoomModel roomModel)
        {
            using (var dbRepository = new DbRepository())
            {
                dbRepository.SaveRoomModel(roomModel);
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
                new EmployeeInfo {Id = 5, FioShort = "Кравчук Л.Н."},
                new EmployeeInfo {Id = 6, FioShort = "Кучма Л.Д."},
                new EmployeeInfo {Id = 7, FioShort = "Ющенко В.А."},
                new EmployeeInfo {Id = 8, FioShort = "Янукович В.Ф"}
            };
        }
    }
}
