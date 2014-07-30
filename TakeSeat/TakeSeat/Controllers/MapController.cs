using System.Linq;
using System.Web.Mvc;
using CommonClasses.Models;

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
                    room.CreateTestData();
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
            var roomModel = new RoomModel();
            roomModel.CreateTestData();
            var lines = roomModel.GetCanvasLines(700, 400).ToList();
            return Json(lines, JsonRequestBehavior.AllowGet);
        }

        public void AddNewLine(int canvasX1, int canvasY1, int canvasX2, int canvasY2)
        {
            Room.AddNewLine(canvasX1, canvasY1, canvasX2, canvasY2);
        }
    }
}
