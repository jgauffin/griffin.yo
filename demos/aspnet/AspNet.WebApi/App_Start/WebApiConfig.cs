using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace AspNet.WebApi.App_Start
{
    using System.Web.Http;

    class WebApiConfig
    {
        public static void Register(HttpConfiguration configuration)
        {
            configuration.MapHttpAttributeRoutes();
            configuration.Routes.MapHttpRoute("API Default", "api/{controller}/{id}",
                new {id = RouteParameter.Optional});
        }
    }
}