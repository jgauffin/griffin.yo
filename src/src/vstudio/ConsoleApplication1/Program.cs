using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ConsoleApplication1
{
    class Program
    {
        static void Main(string[] args)
        {
            var value = int.Parse("409", System.Globalization.NumberStyles.HexNumber);
            var ci2 = new CultureInfo(value);

            var cult = Thread.CurrentThread.CurrentCulture;
            var cultures = CultureInfo.GetCultures(CultureTypes.AllCultures).ToList();
            var cult2 = cultures.Where(x => x.LCID == 409);
        }
    }
}
