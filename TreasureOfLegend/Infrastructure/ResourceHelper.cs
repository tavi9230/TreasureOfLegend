using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using Newtonsoft.Json;
using TreasureOfLegend.Web.Resources;

namespace TreasureOfLegend.Web.Infrastructure
{
    public static class ResourceHelper
    {
        public static string GetResourcesJson()
        {
            var jsonSerializer = new JsonSerializer();
            var resources = GetResourceSet();
            string result;

            using (var stringWriter = new StringWriter())
            {
                using (var jsonTextWriter = new JsonTextWriter(stringWriter))
                {
                    jsonSerializer.Serialize(jsonTextWriter, resources);

                    result = stringWriter.ToString();
                }
            }

            return result;
        }

        private static Dictionary<string, string> GetResourceSet()
        {
            var result = new Dictionary<string, string>();

            var resources = Strings.ResourceManager.GetResourceSet(CultureInfo.CurrentUICulture, true, true);
            foreach (DictionaryEntry resource in resources)
            {
                result.Add(resource.Key.ToString(), resource.Value.ToString());
            }

            return result;
        }
    }
}