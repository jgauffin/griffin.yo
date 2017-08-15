using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Web.Models
{
    public class FileNode
    {
        private readonly IDictionary<string, FileNode> _nodes =
            new Dictionary<string, FileNode>();

        public FileNode()
        {
            OurPathName = "Root";
            FullPath = "/";
        }

        /// <summary>
        /// Name of current node only (either a directory name or a file name)
        /// </summary>
        public string OurPathName { get; private set; }

        /// <summary>
        /// full path
        /// </summary>
        public string FullPath { get; private set; }

        public void AddPath(string fullChildPath)
        {
            if (fullChildPath == null) throw new ArgumentNullException(nameof(fullChildPath));
            if (!fullChildPath.StartsWith(FullPath))
                throw new ArgumentException($"Path '{fullChildPath}' is not part of our path '{FullPath}'.");


            var parts = fullChildPath.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            var current = this;
            for (int i = 0; i < parts.Length; i++)
            {
                var part = parts[i];
                if (!current._nodes.TryGetValue(part, out FileNode child))
                {
                    child = new FileNode
                    {
                        FullPath = string.Join("/", parts.Take(i + 1)),
                        OurPathName = part
                    };
                    current._nodes[part] = child;
                }

                current = child;
            }
        }

        public string GenerateList()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("<ul class=\"file-tree\">");
            foreach (var node in _nodes.Values)
            {
                node.GenerateList(sb);
            }

            sb.AppendLine("</ul>");
            return sb.ToString();
        }

        protected void GenerateList(StringBuilder sb)
        {
            if (!_nodes.Any())
            {
                if (OurPathName.Contains("."))
                    sb.AppendLine($"<li data-path=\"{FullPath}\"><span class=\"fa fa-file\"></span> {OurPathName}</li>");
                else
                    sb.AppendLine($"<li><span class=\"fa fa-folder-open\"></span> {OurPathName}</li>");
                return;
            }

            sb.AppendLine($"<li><span class=\"fa fa-folder-open\"></span> {OurPathName}");
            {
                sb.AppendLine("<ul class=\"file-tree\">");
                foreach (var node in _nodes.Values)
                {
                    node.GenerateList(sb);
                }

                sb.AppendLine("</ul>");
            }
            sb.AppendLine("</li>");
        }
    }
}