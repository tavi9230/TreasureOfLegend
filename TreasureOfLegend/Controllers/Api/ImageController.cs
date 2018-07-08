using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.IO;
using System;
using System.Collections.Generic;

namespace TreasureOfLegend.Controllers.Api
{
    [RoutePrefix("api/image")]
    public class ImageController : ApiController
    {
        [Route("GetImages")]
        public List<string> GetTileImage()
        {
            var imageList = new List<string>();
            var myDir = Directory.GetFiles(AppDomain.CurrentDomain.GetData("DataDirectory").ToString() + "/Images/Tileset");
            for (var i = 0; i < myDir.Length; i++)
            {
                System.Drawing.Image img = System.Drawing.Image.FromFile(AppDomain.CurrentDomain.GetData("DataDirectory") + string.Format("/Images/Tileset/tileset{0}.png", i));
                using (MemoryStream ms = new MemoryStream())
                {
                    img.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                    imageList.Add(Convert.ToBase64String(ms.ToArray()));
                }
            }
            return imageList;
        }
    }
}