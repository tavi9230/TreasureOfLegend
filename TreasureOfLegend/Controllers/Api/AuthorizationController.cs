using System.Web.Http;

namespace TreasureOfLegend.Controllers.Api
{
    [RoutePrefix("api/authorization")]
    public class AuthorizationController : ApiController
    {
        [Route("login")]
        [HttpGet]
        public bool Login()
        {
            return true;
        }
    }
}