using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Packager.Console
{
    class Program
    {
        private static bool _disableModules;
        private static string _sourceFolder;

        static void Main(string[] args)
        {
            var cmdLine = new SimpleCommandLineParser();
            cmdLine.Parse(args);

            if (!cmdLine.Contains("sourceFolder") || !cmdLine.Contains("outputFile"))
            {
                System.Console.WriteLine("Packager");
                System.Console.WriteLine(" - Builds a single typescript file from a folder structure, where the folders represent the module/namespace.");
                System.Console.WriteLine();
                System.Console.WriteLine("Arguments:");
                System.Console.WriteLine("==========");
                System.Console.WriteLine("    -sourceFolder         Folder to parse");
                System.Console.WriteLine("    -outputFile           Path and filename for the typescript file to create.");
                System.Console.WriteLine("    -disableModules       Do not generate modules from the folders");
                System.Console.WriteLine(
                    "    -rootModule           Root module name, typically company name or similar.");
                Environment.ExitCode = -1;
                return;
            }

            var currentDirectory = Environment.CurrentDirectory;
            if (Debugger.IsAttached)
                currentDirectory = Path.GetFullPath(currentDirectory + "\\..\\..");

            _sourceFolder = Path.GetFullPath(Path.Combine(currentDirectory, cmdLine.Arguments["sourceFolder"][0]));
            var outputFile = Path.GetFullPath(Path.Combine(currentDirectory, cmdLine.Arguments["outputFile"][0]));
            var rootModule = cmdLine.Contains("rootModule") ? cmdLine.Arguments["rootModule"][0] : "";
            _disableModules = cmdLine.Contains("disableModules");

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("// Do not modify this file! It's genEraTeD!");
            sb.AppendLine("//");
            sb.AppendLine("// Modifications should be done in the lib\\ folder.");
            sb.AppendLine("//");
            sb.AppendLine(
                "// If you know how to change all files so that everything can be generated as a single file (or for commonJs/AMD) ");
            sb.AppendLine(
                "// I would be really happy. Because I gave up and built the tool in the Packager folder. Run it if you modify any of the scripts.");
            sb.AppendLine(
                "// A bit cumbersome, but WTF do you do when you have spend hours and hours trying to figure out the module management in Typescript?");
            sb.AppendLine();
            sb.AppendLine();

            if (rootModule != "")
            {
                sb.AppendLine("module " + rootModule + " {");
                sb.AppendLine();
            }

            ScanDirectory(_sourceFolder, sb);
            if (rootModule != "")
                sb.AppendLine("}");

            File.WriteAllText(outputFile, sb.ToString(), Encoding.UTF8);
        }

        private static void ScanDirectory(string directory, StringBuilder sb)
        {
            var files = Directory.GetFiles(directory, "*.ts");
            var moduleName = directory.TrimEnd('\\', '/');
            var pos = directory.LastIndexOfAny(new[] { '\\', '/' });
            moduleName = moduleName.Substring(pos + 1);
            if (!_disableModules && !IsRootFolder(directory))
            {
                sb.AppendLine("");
                sb.AppendLine("module " + moduleName + " {");
            }

            if (!IsRootFolder(directory))
            {
                foreach (var file in files)
                {
                    var text = File.ReadAllText(file, Encoding.UTF8);
                    sb.AppendLine(text);
                }
                
            }

            var dirs = Directory.GetDirectories(directory);
            foreach (var dir in dirs)
            {
                ScanDirectory(dir, sb);
            }

            if (IsRootFolder(directory))
            {
                foreach (var file in files)
                {
                    var text = File.ReadAllText(file, Encoding.UTF8);
                    sb.AppendLine(text);
                }

            }


            if (!_disableModules && !IsRootFolder(directory))
            {
                sb.AppendLine("}");
                sb.AppendLine();
            }
        }

        private static bool IsRootFolder(string directory)
        {
            return directory == _sourceFolder;
        }
    }
}
