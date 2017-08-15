using System;
using System.Linq;
using System.Web.Mvc;
using Web.Models;

namespace Web.Controllers
{
    public class SamplesController : Controller
    {
        // GET: Samples
        public ActionResult Index()
        {
            ExampleReader reader = new ExampleReader();
            var samples = reader.Read().ToList();
            return View(samples.First());
        }

        [Route("sample/{sampleName}/viewModel/{modelName}")]
        public ActionResult ViewModel(string sampleName, string modelName)
        {
            var reader = new ExampleReader();
            var samples = reader.Read().ToList();
            var sample = samples.First(x => x.Filename == sampleName);
            var model = reader.GetViewModel(sample, modelName);
            return Content(model, "application/javascript");
        }

        [Route("sample/resource/{sampleName}/{*path}")]
        public ActionResult Resource(string sampleName, string path)
        {
            path = path.Replace(".", "").Replace("\\", "/").Replace(":", "");

            var reader = new ExampleReader();
            var contents = reader.GetSampleFile(sampleName, path);
            return Content(contents, "text/plain");
        }

        [Route("sample/{name}")]
        public ActionResult Sample(string name)
        {
            var reader = new ExampleReader();
            var samples= reader.Read().ToList();
            ViewBag.Samples = samples;
            var sample = samples.FirstOrDefault(x => x.Filename == name);
            if (sample != null && sample.Section.Equals("Spa", StringComparison.OrdinalIgnoreCase))
                return RenderSpa(sample);

            return View(sample);
        }

        private ActionResult RenderSpa(CodeSample sample)
        {

            return View("Spa", sample);
        }
    }
}