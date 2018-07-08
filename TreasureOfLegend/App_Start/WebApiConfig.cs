using System.Web.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using TreasureOfLegend.Web.Infrastructure;

namespace TreasureOfLegend.Web
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional });
        }

        public static void ConfigureJsonFormatter(HttpConfiguration config)
        {
            //settings to return camelCase json
            var jsonFormatter = config.Formatters.JsonFormatter;
            var settings = jsonFormatter.SerializerSettings;
            settings.Formatting = Formatting.Indented;
            settings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        }

        public static void ConfigureAutoMapper()
        {
            AutomapperHelper.Configure();
        }
    }
}
