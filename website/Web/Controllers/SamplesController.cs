using System;
using System.Collections.Generic;
using System.Linq;
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
    }
}