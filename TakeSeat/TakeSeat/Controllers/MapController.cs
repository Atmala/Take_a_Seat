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

        public IEnumerable<Line> GetRoomModel(int canvasWidth, int canvasHeight)
        {
            return Room.GetCanvasLines(canvasWidth, canvasHeight);
        }

        public void AddNewLine(int canvasX1, int canvasY1, int canvasX2, int canvasY2)
        {
            Room.AddNewLine(canvasX1, canvasY1, canvasX2, canvasY2);
        }
    }
}
