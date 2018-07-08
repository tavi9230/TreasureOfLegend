using System.Web.Mvc;

namespace TreasureOfLegend.Web.Controllers
{
    public class LandingController : Controller
    {

        [Route("~/")]
        [Route("*")]
        public ActionResult Index()
        {
            return View();
        }
    }
}