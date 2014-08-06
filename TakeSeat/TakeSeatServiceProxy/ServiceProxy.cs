using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonClasses.Models;
using DbLayer;

namespace TakeSeatServiceProxy
{
    public static class ServiceProxy
    {
        public static void SaveRoom(RoomModel roomModel)
        {
            using (var dbRepository = new DbRepository())
            {
                dbRepository.SaveRoomModel(roomModel);
            }
        }
    }
}
