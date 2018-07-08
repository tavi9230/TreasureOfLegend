using System.Web.Http.Dependencies;
using Unity;

namespace TreasureOfLegend.Web.Infrastructure.UnityHelper.WebApi
{
    public class IoCContainer : ScopeContainer, IDependencyResolver
    {
        public IoCContainer(IUnityContainer container)
            : base(container)
        {
        }

        public IDependencyScope BeginScope()
        {
            var child = Container.CreateChildContainer();
            return new ScopeContainer(child);
        }
    }
}