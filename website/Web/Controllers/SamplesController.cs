using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.AccessControl;
using System.Web;
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

        [Route("sample/{name}")]
        public ActionResult Sample(string name)
        {
            var reader = new ExampleReader();
            var samples= reader.Read().ToList();
            ViewBag.Samples = samples;
            var sample = samples.FirstOrDefault(x => x.Filename == name);
            if (sample != null && sample.Section == "Spa")
                return RenderSpa(sample);

            return View(sample);
        }

        private ActionResult RenderSpa(CodeSample sample)
        {

            return View("Spa", sample);
        }
    }
}