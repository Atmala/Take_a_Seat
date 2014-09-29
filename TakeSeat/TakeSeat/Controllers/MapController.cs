using System.Linq;
using System.Web.Mvc;
using CommonClasses.InfoClasses;
using CommonClasses.Models;
using TakeSeatServiceProxy;

namespace TakeSeat.Controllers
{
    public class MapController : Controller
    {
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
            return View();
        }

        [HttpGet]
        public JsonResult Get()
        {
            //var json = new JavaScriptSerializer().Serialize(Room);
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
            return Json(ServiceProxy.GetEmployeesWithoutSeat(), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult SaveWall(LineInfo lineInfo)
        {
            var id = ServiceProxy.SaveWall(Room.Id, lineInfo.X1, lineInfo.Y1, lineInfo.X2, lineInfo.Y2);
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
            var roomObject = Room.RoomObjects.First(ro => ro.Id == id);
            Room.RoomObjects.Remove(roomObject);
            ServiceProxy.DeleteRoomObject(id);
        }
    }
}
