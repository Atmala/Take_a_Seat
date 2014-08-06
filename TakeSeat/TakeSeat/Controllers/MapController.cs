using System.Linq;
using System.Web.Mvc;
using System.Web.Script.Serialization;
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
                    var room = new RoomModel();
                    //room.CreateTestData();
                    //room.SetParametersByCanvasSize(700, 400);
                    Session["Room"] = room;
                }
                return (RoomModel) Session["Room"];
            }
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
        public void SaveLine(int canvasX1, int canvasY1, int canvasX2, int canvasY2)
        {
            //Room.AddNewLine(canvasX1, canvasY1, canvasX2, canvasY2);
        }
        [HttpPost]
        public JsonResult MoveFullImage (int shiftX, int shiftY)
        {
            //Room.MoveImage(shiftX, shiftY);
            //var lines = Room.GetCanvasLines();
            return Json(Room, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public void SaveRoom(RoomModel room)
        {
            ServiceProxy.SaveRoom(room);
        }
    }
}
