using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using TreasureOfLegend.Web.Infrastructure.UnityHelper;
using Webpack.NET;

namespace TreasureOfLegend.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            UnityConfig.ConfigureUnityContainer();
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            WebApiConfig.ConfigureJsonFormatter(GlobalConfiguration.Configuration);
            WebApiConfig.ConfigureAutoMapper();
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            this.ConfigureWebpack(new WebpackConfig
            {
                AssetManifestPath = "~/Pack/webpack-assets.json",
                AssetOutputPath = "~/Pack"
            });
        }
    }
}
