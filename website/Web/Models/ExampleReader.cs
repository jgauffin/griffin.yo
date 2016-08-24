using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using CsQuery;

namespace Web.Models
{
    public class ExampleReader
    {
        public IEnumerable<Demo> Read()
        {
            var demoDirectory = ConfigurationManager.AppSettings["DemoDirectory"];
            demoDirectory = Path.Combine(HostingEnvironment.MapPath("~/"), demoDirectory);
            demoDirectory = Path.GetFullPath(demoDirectory);

            var files = Directory.GetFiles(Path.Combine(demoDirectory, "Forms"), "*.html");
            foreach (var file in files)
            {
                var content = File.ReadAllText(file);
                var parser = new AngleSharp.Parser.Html.HtmlParser();
                var selector = parser.Parse(content);

                //var cq=CQ.CreateDocument(content);
                var title = selector.Title;
                if (title == "Demo")
                {
                    title = Path.GetFileNameWithoutExtension(file).Replace('_', ' ');
                    title = char.ToUpper(title[0]) + title.Substring(1);
                }
                var description = selector.QuerySelector("#Description").InnerHtml;
                var view = selector.QuerySelector("#MyView").InnerHtml;
                view = view.Replace("\r\n			", "");
                view = view.Replace("\r\n            ", "");


                var script = selector.QuerySelector("#example-script").OuterHtml;
                script = script.Replace("\r\n		", "");
                script = script.Replace("\r\n        ", "");
                yield return new Demo
                {
                    Title = title,
                    Description = description,
                    View = view,
                    Script = script
                };
            }

        }
    }

    public class Demo
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string View { get; set; }
        public string Script { get; set; }
    }
}