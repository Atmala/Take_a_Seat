﻿using System.Linq;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using CommonClasses.Models;

namespace TakeSeat.Controllers
{
    public class MapController : Controller
    {
        public RoomModel2 Room
        {
            get
            {
                if (Session["Room"] == null)
                {
                    var room = new RoomModel2();
                    room.CreateTestData();
                    //room.SetParametersByCanvasSize(700, 400);
                    Session["Room"] = room;
                }
                return (RoomModel2) Session["Room"];
            }
        }
        //
        // GET: /Map/
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetRoom()
        {
<<<<<<< .mine
            var lines = Room.GetCanvasLines().ToList();
=======
            //var lines = Room.GetCanvasLines().ToList();
>>>>>>> .theirs
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
    }
}
