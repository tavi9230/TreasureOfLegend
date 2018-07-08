using System.Web.Mvc;

namespace TreasureOfLegend.Web.Controllers
{
    [RoutePrefix("Error")]
    public class ErrorController : Controller
    {
        [Route("")]
        public ActionResult Error()
        {
            return View();
        }
    }
}