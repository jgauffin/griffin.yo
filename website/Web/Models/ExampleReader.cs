using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web.Hosting;

namespace Web.Models
{
    public class ExampleReader
    {
        public IEnumerable<CodeSample> ReadSection(string sectionName)
        {
            var files = Directory.GetFiles(Path.Combine(DemoDirectory, sectionName), "*.html");
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
                yield return new CodeSample
                {
                    Title = title,
                    Description = description,
                    View = view,
                    Script = script,
                    Filename = Path.GetFileNameWithoutExtension(file),
                    Section = sectionName
                };
            }

        }

        public IEnumerable<CodeSample> ReadSpaSection()
        {
            var dirs = Directory.GetDirectories(Path.Combine(DemoDirectory, "Spa"));
            foreach (var dir in dirs)
            {
                if (dir.EndsWith("lib"))
                    continue;

                var file = Directory.GetFiles(dir, "*.html").First();
                var content = File.ReadAllText(file);
                var parser = new AngleSharp.Parser.Html.HtmlParser();
                var selector = parser.Parse(content);

                //var cq=CQ.CreateDocument(content);
                var title = selector.Title;
                if (title == "Demo")
                {
                    var pos = dir.TrimEnd('\\').LastIndexOf('\\');
                    title = dir.Substring(pos).TrimEnd('\\');
                    title = char.ToUpper(title[0]) + title.Substring(1);
                }
                var description = selector.QuerySelector("#Description")?.InnerHtml;
                var view = (selector.QuerySelector("#MyView") ?? selector.QuerySelector("#YoView")).InnerHtml;
                view = view.Replace("\r\n			", "");
                view = view.Replace("\r\n            ", "");

                var rootFileNode = GenerateFileList(dir);

                string routeSection = null;
                string script = null;
                var exampleScript = selector.QuerySelector("#example-script");
                if (exampleScript != null)
                {
                    routeSection = exampleScript.GetAttribute("section");
                    script = selector.QuerySelector("#example-script").OuterHtml;
                    script = script.Replace("\r\n		", "");
                    script = script.Replace("\r\n        ", "");
                }
                yield return new CodeSample
                {
                    Title = title.Replace(".", " - "),
                    Description = description,
                    View = view,
                    Script = script,
                    Filename = Path.GetFileNameWithoutExtension(file),
                    Section = "SPA",
                    RouteSection = routeSection,
                    Files = rootFileNode
                };
            }

        }

        private static FileNode GenerateFileList(string dir)
        {
            var root= new FileNode() ;
            foreach (var subdir in Directory.GetDirectories(dir))
            {
                GenerateFileList(dir, subdir, root);
            }
            return root;
        }

        private static void GenerateFileList(string rootDir, string dir, FileNode root)
        {
            foreach (var subFile in Directory.GetFiles(dir))
            {
                var name = subFile.Remove(0, rootDir.Length).Replace('\\', '/');
                root.AddPath(name);
            }

            foreach (var subdir in Directory.GetDirectories(dir))
            {
                GenerateFileList(rootDir, subdir, root);
            }
        }

        public IEnumerable<CodeSample> Read()
        {

            foreach (var sample in ReadSection("Forms"))
            {
                yield return sample;
            }
            foreach (var sample in ReadSection("Rendering"))
            {
                yield return sample;
            }
            foreach (var sample in ReadSpaSection())
            {
                yield return sample;
            }

        }

        private string DemoDirectory
        {
            get
            {
                var demoDirectory = ConfigurationManager.AppSettings["DemoDirectory"];
                demoDirectory = Path.Combine(HostingEnvironment.MapPath("~/"), demoDirectory);
                demoDirectory = Path.GetFullPath(demoDirectory);
                return demoDirectory;
            }
        }

        public string GetViewModel(CodeSample sample, string modelName)
        {
            var directory = Path.Combine(DemoDirectory, "Spa", sample.Filename, "ViewModels", modelName + "ViewModel.js");
            return File.ReadAllText(directory);
        }

        public string GetSampleFile(string sampleName, string path)
        {
            var fullPath = Path.Combine(DemoDirectory, sampleName, path);
            return File.ReadAllText(fullPath);
        }
    }
}