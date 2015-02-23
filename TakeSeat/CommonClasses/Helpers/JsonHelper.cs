using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Runtime.Serialization.Json;

namespace CommonClasses.Helpers
{
    public static class JsonHelper
    {
        public static string JsonSerializer<T>(T target)
        {
            var serializer = new DataContractJsonSerializer(typeof(T));
            var stream = new MemoryStream();
            serializer.WriteObject(stream, target);
            string jsonString = Encoding.UTF8.GetString(stream.ToArray());
            stream.Close();
            return jsonString;
        }

        public static T JsonDeserialize<T>(string jsonString)
        {
            var serializer = new DataContractJsonSerializer(typeof(T));
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(jsonString));
            var result = (T)serializer.ReadObject(stream);
            return result;
        }
    }
}