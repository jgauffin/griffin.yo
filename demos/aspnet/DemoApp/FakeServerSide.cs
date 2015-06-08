using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Web.Infrastructure.DynamicModuleHelper;
using YoTest;

[assembly:PreApplicationStartMethod(typeof(FakeServerSide), "Startup")]

namespace YoTest
{
    /// <summary>
    /// Just to fake a real request.
    /// </summary>
    public class FakeServerSide : IHttpModule
    {
        public static void Startup()
        {
            DynamicModuleUtility.RegisterModule(typeof(FakeServerSide));
        }

        public void Init(HttpApplication context)
        {
            context.BeginRequest += OnRequest;
        }

        private void OnRequest(object sender, EventArgs e)
        {
            var app = (HttpApplication) sender;
            if (app.Request.Url.AbsolutePath != "/user/1")
                return;

            app.Response.ContentType = "application/json";
            app.Response.Output.Write(@"{ ""Id"": 1, ""FirstName"": ""Jonas"", ""LastName"": ""Gauffin"" }");
            app.Response.StatusCode = 200;
            app.Response.End();
        }

        public void Dispose()
        {

        }
    }
}