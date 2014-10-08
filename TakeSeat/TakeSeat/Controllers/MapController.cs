using System.Linq;
using System.Web.Mvc;
using CommonClasses.InfoClasses;
using CommonClasses.Models;
using NLog;
using TakeSeatServiceProxy;

namespace TakeSeat.Controllers
{
    public class MapController : Controller
    {
        private static Logger _logger = LogManager.GetLogger("MapController.cs");
        public RoomModel Room
        {
            get
            {
                if (Session["Room"] == null)
                {
                    var room = ServiceProxy.GetFirstRoom();
                    if (room == null) room = ServiceProxy.SaveRoom(new RoomModel());
                    Session["Room"] = room;
                }
                return (RoomModel) Session["Room"];
            }
            set { Session["Room"] = value; }
        }
        //
        // GET: /Map/
        public ActionResult Index()
        {
            _logger.Info("Index()");
            return View();
        }

        [HttpGet]
        public JsonResult Get()
        {
            Room = null;
            var result = Json(Room, JsonRequestBehavior.AllowGet);
            return result;
        }

        [HttpPost]
        public void SaveRoom(RoomModel room)
        {
            Room = ServiceProxy.SaveRoom(room);
        }

        [HttpGet]
        public JsonResult GetEmployeesWithoutSeat()
        {
            _logger.Info("GetEmployeesWithoutSeat");
            return Json(ServiceProxy.GetEmployeesWithoutSeat(), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult SaveWall(LineInfo lineInfo)
        {
            var id = ServiceProxy.SaveWall(Room.Id, lineInfo.RoomObjectId, lineInfo.X1, lineInfo.Y1, lineInfo.X2, lineInfo.Y2);
            var response = new {Id = id};
            return Json(response);
        }

        [HttpPost]
        public JsonResult SaveTable(RectangleInfo rectangleInfo)
        {
            var id = ServiceProxy.SaveTable(Room.Id, rectangleInfo.RoomObjectId, rectangleInfo.LeftTopX, rectangleInfo.LeftTopY,
                rectangleInfo.Width, rectangleInfo.Height);
            var response = new {Id = id};
            return Json(response);
        }

        [HttpPost]
        public void SaveEmployeeTableLink(EmployeeTableLinkInfo employeeTableLinkInfo)
        {
            ServiceProxy.SaveEmployeeTableLink(employeeTableLinkInfo);
        }

        [HttpPost]
        public void RemoveEmployeeTableLink(EmployeeTableLinkInfo employeeTableLinkInfo)
        {
            var roomObject = Room.RoomObjects.FirstOrDefault(r => r.Id == employeeTableLinkInfo.RoomObjectId);
            if (roomObject != null)
            {
                roomObject.EmployeeFio = string.Empty;
                roomObject.EmployeeId = 0;
            }
            ServiceProxy.RemoveEmployeeTableLink(employeeTableLinkInfo);
        }

        [HttpDelete]
        public void DeleteRoomObject(int id)
        {
            var roomObject = Room.RoomObjects.FirstOrDefault(ro => ro.Id == id);
            if (roomObject != null) Room.RoomObjects.Remove(roomObject);
            ServiceProxy.DeleteRoomObject(id);
        }

        [HttpGet]
        public JsonResult GetRooms()
        {
            var response = ServiceProxy.GetRooms();
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ChangeRoom(int roomId)
        {
            Room = ServiceProxy.GetRoom(roomId);
            var result = Json(Room, JsonRequestBehavior.AllowGet);
            return result;
        }

        [HttpGet]
        public JsonResult CreateNewRoom(string caption)
        {
            var roomInfo = ServiceProxy.CreateNewRoom(caption);
            return Json(roomInfo, JsonRequestBehavior.AllowGet);
            //Room = ServiceProxy.GetRoom(roomId);
            //var result = Json(Room, JsonRequestBehavior.AllowGet);
            //return result;
        }
    }
}
