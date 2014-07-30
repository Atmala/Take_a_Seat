using System.Web.Mvc;
using CommonClasses.Models;

namespace TakeSeat.Controllers
{
    public class MapController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult Get()
        {
            var roomModel = new RoomModel();
            roomModel.CreateTestData();
            var lines = roomModel.GetCanvasLines(700, 400);
            return Json(lines, JsonRequestBehavior.AllowGet);
        }
    }
}

