using System;
using System.Collections.Generic;
using System.Web.Http.Dependencies;
using Unity;

namespace TreasureOfLegend.Web.Infrastructure.UnityHelper.WebApi
{
    public class ScopeContainer : IDependencyScope
    {
        protected IUnityContainer Container { get; set; }

        public ScopeContainer(IUnityContainer container)
        {
            if (container == null)
            {
                throw new ArgumentNullException("container");
            }
            this.Container = container;
        }

        public object GetService(Type serviceType)
        {
            if (Container.IsRegistered(serviceType))
            {
                return Container.Resolve(serviceType);
            }

            return null;
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            /* Note: One possible implementation suggested by msdn
            Keeping the code commented since in ProDemand we do not have multiple type registrations
            When tried to run this code through unit test, Container.Resolve did not behave as expected
            Help document on Resolve: http://msdn.microsoft.com/en-us/library/ff660853(v=pandp.20).aspx */

            if (Container.IsRegistered(serviceType))
            {
                // ResolveAll does not include the default mapping (the one without a name)
                return Container.ResolveAll(serviceType);
            }
            else
            {
                return new List<object>();
            }
        }

        public void Dispose()
        {
            Container.Dispose();
        }
    }
}