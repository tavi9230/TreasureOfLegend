using System.Web.Http;
using System.Web.Mvc;
using TreasureOfLegend.Web.Infrastructure.UnityHelper.WebApi;
using Unity;

namespace TreasureOfLegend.Web.Infrastructure.UnityHelper
{
    public class UnityConfig
    {
        private static IUnityContainer container;

        public static void ConfigureUnityContainer(UnityContainer containerParam = null)
        {
            container = containerParam ?? new UnityContainer();

            GlobalConfiguration.Configuration.DependencyResolver = new IoCContainer(container);
            ControllerBuilder.Current.SetControllerFactory(new UnityControllerFactory(container));
        }

        public static T Resolve<T>()
        {
            return container.Resolve<T>();
        }
    }
}