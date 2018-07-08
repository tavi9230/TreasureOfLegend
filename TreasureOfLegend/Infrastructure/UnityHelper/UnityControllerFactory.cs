using System;
using System.Web.Mvc;
using System.Web.Routing;
using Unity;

namespace TreasureOfLegend.Web.Infrastructure.UnityHelper
{
    public class UnityControllerFactory : DefaultControllerFactory
    {
        private readonly IUnityContainer container;

        public UnityControllerFactory(IUnityContainer container)
        {
            this.container = container;
        }

        protected override IController GetControllerInstance(RequestContext requestContext, Type controllerType)
        {
            if (controllerType == null)
            {
                throw new ArgumentNullException(nameof(controllerType));
            }

            if (!typeof(IController).IsAssignableFrom(controllerType))
            {
                throw new ArgumentException($"Type requested is not a controller: {controllerType.Name}", nameof(controllerType));
            }

            return container.Resolve(controllerType) as IController;
        }
    }
}