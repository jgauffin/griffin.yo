using System.Collections.Generic;

namespace Web.Models
{
    public class CodeSample
    {
        public string Description { get; set; }
        public string Filename { get; set; }
        public FileNode Files { get; set; }
        public string RouteSection { get; set; }
        public string Script { get; set; }
        public string Section { get; set; }
        public string Title { get; set; }
        public string View { get; set; }
    }
}