using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CommonClasses.Models;

namespace TakeSeat.Controllers
{
    public class MapController : Controller
    {
        //
        // GET: /Map/


        public ActionResult Index()
        {
            return View();
        }

        public IEnumerable<Line> GetRoomModel(int canvasWidth, int canvasHeight)
        {
            var roomModel = new RoomModel();
            roomModel.CreateTestData();
            return roomModel.GetCanvasLines(canvasWidth, canvasHeight);
        }
    }
}

