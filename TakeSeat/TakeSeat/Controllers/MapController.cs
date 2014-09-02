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
        public void SaveWall(LineInfo lineInfo)
        {
            ServiceProxy.SaveWall(Room.Id, lineInfo.X1, lineInfo.Y1, lineInfo.X2, lineInfo.Y2);
            //return Json(ServiceProxy.SaveWall(Room.Id, x1, y1, x2, y2));
        }

        [HttpPost]
        public void SaveTable(RectangleInfo rectangleInfo)
        {
            ServiceProxy.SaveTable(Room.Id, rectangleInfo.LeftTopX, rectangleInfo.LeftTopY,
                rectangleInfo.Width, rectangleInfo.Height);
        }

        [HttpPost]
        public void SaveEmployeeTableLink(EmployeeTableLinkInfo employeeTableLinkInfo)
        {
            ServiceProxy.SaveEmployeeTableLink(employeeTableLinkInfo);
        }
    }
}
