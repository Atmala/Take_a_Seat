using System.Web.Mvc;
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
                    var room = ServiceProxy.GetFirstRoom() ?? new RoomModel();
                    room.RoomObjects.Clear();
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
    }
}
