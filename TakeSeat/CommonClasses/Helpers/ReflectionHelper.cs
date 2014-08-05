#region Directievs

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;

#endregion

namespace CommonClasses.Helpers
{
    public class ReflectionHelper
    {
        public static bool TypeCanBeRestoredFromString(Type type)
        {
            // we ckeck for "entitystate" property - cause it accures on some machines
            return (type.IsValueType && !type.Name.Equals("entitystate", StringComparison.CurrentCultureIgnoreCase))
                    || IsNullable(type) || type.IsPrimitive ||
                   type.Name.Equals("string", StringComparison.CurrentCultureIgnoreCase) ||
                   type.Name.Equals("datetime", StringComparison.CurrentCultureIgnoreCase);
        }

        public static void CopyAllProperties(object src, object dest)
        {
            CopyAllProperties(src, dest, new List<string>());
        }

        public static void CopyAllProperties(object src, object dest, List<String> notCopyList)
        {
            var destProperties = dest.GetType().GetProperties().Where(p => p.CanWrite).ToDictionary(p => p.Name, p => p);
            var propertyInfos = src.GetType().GetProperties().Where(
                p => !notCopyList.Contains(p.Name)
                    && (p.PropertyType.IsValueType || p.PropertyType == typeof(string))
                    && destProperties.Keys.Contains(p.Name)
                    && destProperties[p.Name].PropertyType == p.PropertyType
                );

            foreach (var propertyInfo in propertyInfos)
            {
                destProperties[propertyInfo.Name].SetValue(dest, propertyInfo.GetValue(src, null), null);
            }
        }

        public static bool PropertiesAreEqual(object obj1, object obj2, PropertyInfo propertyInfo)
        {
            object value1 = propertyInfo.GetValue(obj1, null);
            object value2 = propertyInfo.GetValue(obj2, null);
            return ValuesAreEqual(value1, value2, propertyInfo.PropertyType.FullName);
        }

        public static bool ValuesAreEqual(object value1, object value2, string typeFullName)
        {
            if (typeFullName == "System.String")
            {
                return (String.IsNullOrEmpty((string)value1) && String.IsNullOrEmpty((string)value2) ||
                        String.Compare((string)value1, (string)value2) == 0);
            }

            if (value1 == null)
                return value2 == null;

            return value1.Equals(value2);
        }

        public static bool CompareAllProperties(object src, object dest)
        {
            if (src.GetType() != dest.GetType())
                throw new Exception("src and dest should have the same type");

            PropertyInfo[] propertyInfos;
            propertyInfos = src.GetType().GetProperties();

            foreach (PropertyInfo propertyInfo in propertyInfos)
            {
                if (!PropertiesAreEqual(src, dest, propertyInfo))
                    return false;
            }
            return true;
        }
        
        public static bool IsNullable(Type type)
        {
            return type.IsValueType && type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>);
        }

        public static object ConvertToType(object value, Type type)
        {
            if (type == typeof(bool))
            {
                value = value.Equals("1");
            }
            return Convert.ChangeType(value, type, CultureInfo.InvariantCulture);
        }
    }
}
